const { Position, User, Operation, PushSubscription } = require('../models');
const { Op } = require('sequelize');
const AppError = require('../utils/errors');
const webpush = require('../config/webpush');

const sendEmergencySignal = async (req, res, next) => {
  try {
    const { operation_id, location, message } = req.body;

    if (req.user.role !== 'rescuer') {
      return next(new AppError('Only rescuers can send emergency signals', 403));
    }

    const operation = await Operation.findByPk(operation_id);
    if (!operation) {
      return next(new AppError('Operation not found', 404));
    }

    // Валидация GeoJSON Point + диапазон координат
    if (
      !location ||
      location.type !== 'Point' ||
      !Array.isArray(location.coordinates) ||
      location.coordinates.length !== 2
    ) {
      return next(new AppError('Invalid location format. Expected GeoJSON Point with [longitude, latitude].', 400));
    }

    const [longitude, latitude] = location.coordinates;

    if (
      typeof longitude !== 'number' ||
      typeof latitude !== 'number' ||
      longitude < -180 || longitude > 180 ||
      latitude < -90 || latitude > 90
    ) {
      return next(new AppError('Coordinates must be valid numbers: longitude [-180,180], latitude [-90,90].', 400));
    }

    const emergencyPosition = await Position.create({
      user_id: req.user.id,
      operation_id,
      location,
      accuracy: null,
      synced: true,
      is_emergency: true,
    });

    // Формируем тело уведомления с учётом optional message
    const notificationBody = message
      ? `Спасатель ${req.user.name}: ${message}`
      : `Спасатель ${req.user.name} отправил экстренный сигнал из операции "${operation.name}".`;

    const payload = JSON.stringify({
      title: '🚨 Экстренный сигнал!',
      body: notificationBody,
      tag: 'emergency',
      data: {
        operationId: operation.id,
        userId: req.user.id,
        positionId: emergencyPosition.id,
        location: emergencyPosition.location,
      },
    });

    // 🔒 Получаем только тех пользователей, кто участвует в ЭТОЙ операции
    // Предполагается, что у User есть поле `current_operation_id`
    // Если используется связь через промежуточную таблицу (например, UserOperation),
    // замените этот запрос на JOIN или подзапрос.
    const targetUsers = await User.findAll({
      where: {
        current_operation_id: operation_id, // ← привязка к операции
        role: { [Op.in]: ['coordinator', 'senior_on_site'] },
      },
    });

    if (targetUsers.length === 0) {
      console.warn(`No authorized users found in operation ${operation_id} to notify.`);
    }

    const userIds = targetUsers.map(u => u.id);
    const subscriptions = await PushSubscription.findAll({
      where: {
        user_id: { [Op.in]: userIds },
      },
    });

    const notificationPromises = subscriptions.map(async (sub) => {
      const subscriptionObject = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      try {
        await webpush.sendNotification(subscriptionObject, payload);
        console.log(`Notification sent to user ${sub.user_id} via endpoint ${sub.endpoint}`);
      } catch (error) {
        console.error('Error sending push notification:', error);
        if (error.statusCode === 410 || error.statusCode === 404) {
          console.log(`Deleting invalid subscription: ${sub.endpoint}`);
          await sub.destroy();
        }
      }
    });

    await Promise.allSettled(notificationPromises);

    res.status(201).json({
      status: 'success',
      emergency_position: emergencyPosition,
      message: 'Emergency signal sent successfully and notifications triggered.',
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendEmergencySignal,
};