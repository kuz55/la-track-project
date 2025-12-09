const express = require('express');
const { saveSubscription, deleteSubscription } = require('../controllers/pushController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const Joi = require('joi');
const AppError = require('../utils/errors');

const router = express.Router();

const saveSubscriptionSchema = Joi.object({
  endpoint: Joi.string().uri().required(),
  keys: Joi.object({
    p256dh: Joi.string().required(),
    auth: Joi.string().required(),
  }).required(),
  fcm_token: Joi.string().optional(), // Для мобильных
});

// Сохранение подписки - доступно любому аутентифицированному пользователю
router.post('/subscribe', protect, validate(saveSubscriptionSchema), saveSubscription);

// Удаление подписки - доступно любому аутентифицированному пользователю
router.delete('/unsubscribe/:endpoint', protect, deleteSubscription);

module.exports = router;