const express = require('express');
const { sendPosition, getPositionsForOperation } = require('../controllers/positionController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const Joi = require('joi');

const router = express.Router();

const sendPositionSchema = Joi.object({
  operation_id: Joi.number().integer().required(),
  location: Joi.object({
    type: Joi.string().valid('Point').required(),
    coordinates: Joi.array().items(Joi.number()).length(2).required(), // [lng, lat]
  }).required(),
  accuracy: Joi.number().optional(), // Точность GPS
});

// Только полевые сотрудники могут отправлять позиции
router.post('/', protect, (req, res, next) => {
    if (['senior_on_site', 'group_leader', 'rescuer'].includes(req.user.role)) {
        next();
    } else {
        return next(new AppError('Only field personnel can send positions', 403));
    }
}, validate(sendPositionSchema), sendPosition);

// Только координаторы и старшие могут получать позиции
router.get('/operation/:operationId', protect, (req, res, next) => {
    if (['coordinator', 'senior_on_site', 'group_leader'].includes(req.user.role)) {
        next();
    } else {
        return next(new AppError('Not authorized to view positions', 403));
    }
}, getPositionsForOperation);

module.exports = router;