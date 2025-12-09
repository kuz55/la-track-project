const express = require('express');
const { sendEmergencySignal } = require('../controllers/emergencyController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const Joi = require('joi');
const AppError = require('../utils/errors');

const router = express.Router();

const sendEmergencySignalSchema = Joi.object({
  operation_id: Joi.number().integer().required(),
  location: Joi.object({
    type: Joi.string().valid('Point').required(),
    coordinates: Joi.array().items(Joi.number()).length(2).required(), // [lng, lat]
  }).required(),
  message: Joi.string().optional(), // Дополнительное сообщение
});

// Только спасатели могут отправлять экстренные сигналы
router.post('/', protect, (req, res, next) => {
    if (req.user.role === 'rescuer') {
        next();
    } else {
        return next(new AppError('Only rescuers can send emergency signals', 403));
    }
}, validate(sendEmergencySignalSchema), sendEmergencySignal);

module.exports = router;