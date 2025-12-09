const express = require('express');
const { submitReport, getReportsForOperation } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const Joi = require('joi');

const router = express.Router();

const submitReportSchema = Joi.object({
  content: Joi.string().required(),
  operation_id: Joi.number().integer().required(),
  task_id: Joi.number().integer().optional(), // Может быть не указана
});

// Только полевые сотрудники могут отправлять отчёты
router.post('/', protect, authorize('group_leader', 'rescuer'), validate(submitReportSchema), submitReport);

// Только координаторы, инфорги, старшие могут получать отчёты
router.get('/operation/:operationId', protect, (req, res, next) => {
    if (['coordinator', 'informer', 'senior_on_site', 'group_leader'].includes(req.user.role)) {
        next();
    } else {
        return next(new AppError('Not authorized to view reports', 403));
    }
}, getReportsForOperation);

module.exports = router;