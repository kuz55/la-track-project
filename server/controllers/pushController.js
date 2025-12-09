const { PushSubscription, User } = require('../models');
const AppError = require('../utils/errors');

const saveSubscription = async (req, res, next) => {
  try {
    const { endpoint, keys } = req.body; // keys = { p256dh, auth }
    const userId = req.user.id;

    let subscription = await PushSubscription.findOne({ where: { endpoint } });

    if (subscription) {
      await subscription.update({
        user_id: userId,
        p256dh: keys.p256dh,
        auth: keys.auth,
        fcm_token: req.body.fcm_token || null,
      });
    } else {
      subscription = await PushSubscription.create({
        user_id: userId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        fcm_token: req.body.fcm_token || null,
      });
    }

    res.status(201).json({
      status: 'success',
      subscription: {
        id: subscription.id,
        endpoint: subscription.endpoint,
      },
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return next(new AppError('Subscription endpoint already exists', 400));
    }
    next(error);
  }
};

const deleteSubscription = async (req, res, next) => {
  try {
    const { endpoint } = req.params;

    const subscription = await PushSubscription.findOne({ where: { endpoint } });

    if (!subscription) {
      // Если подписки нет — считаем, что всё в порядке (idempotent)
      return res.status(204).send(); // 204 = No Content, не нужно JSON
    }

    if (subscription.user_id !== req.user.id) {
      return next(new AppError('Not authorized to delete this subscription', 403));
    }

    await subscription.destroy();

    res.status(204).send(); // 204 обычно не содержит тела
  } catch (error) {
    next(error);
  }
};

module.exports = {
  saveSubscription,
  deleteSubscription,
};