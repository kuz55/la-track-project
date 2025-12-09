const { Position, User, Operation } = require('../models');
const AppError = require('../utils/errors');

const sendPosition = async (req, res, next) => {
  try {
    const { operation_id, location, accuracy } = req.body; // location = { type: 'Point', coordinates: [lng, lat] }

    // Проверка: только полевые сотрудники могут отправлять позиции
    if (!['senior_on_site', 'group_leader', 'rescuer'].includes(req.user.role)) {
      return next(new AppError('Only field personnel can send positions', 403));
    }

    // Проверить, что операция существует
    const operation = await Operation.findByPk(operation_id);
    if (!operation) {
      return next(new AppError('Operation not found', 404));
    }

    // Проверить формат location (упрощённо)
    if (!location || location.type !== 'Point' || !Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
        return next(new AppError('Invalid location format. Expected GeoJSON Point.', 400));
    }

    const position = await Position.create({
      user_id: req.user.id, // Позиция от текущего пользователя
      operation_id,
      location, // Sequelize/PostGIS автоматически обработает GeoJSON
      accuracy,
      synced: true, // Если пришёл с мобильного - считаем синхронизированным
    });

    res.status(201).json({
      status: 'success',
      data: {
        position,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getPositionsForOperation = async (req, res, next) => {
  try {
    const { operationId } = req.params;

    // Проверка: может ли пользователь видеть позиции
    if (!['coordinator', 'senior_on_site', 'group_leader'].includes(req.user.role)) {
      return next(new AppError('Not authorized to view positions', 403));
    }

    // Получить последние позиции для всех пользователей в операции
    const latestPositions = await Position.findAll({
      where: { operation_id: operationId },
      order: [
        ['user_id', 'ASC'],
        ['timestamp', 'DESC']
      ],
      distinct: 'user_id', // Получаем только последнюю позицию для каждого пользователя
      include: [
        {
          model: User,
          attributes: ['id', 'name'],
        },
      ],
    });

    res.status(200).json({
      status: 'success',
      results: latestPositions.length,
      data: {
        positions: latestPositions,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendPosition,
  getPositionsForOperation,
};