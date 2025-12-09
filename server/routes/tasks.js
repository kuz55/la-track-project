const express = require('express');
const { createTask, getTasksForOperation, updateTaskStatus } = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const Joi = require('joi');

const router = express.Router();

const createTaskSchema = Joi.object({
  description: Joi.string().required(),
  operation_id: Joi.number().integer().required(),
  assigned_to: Joi.number().integer().optional(), // Может быть не назначен
});

const updateTaskSchema = Joi.object({
  status: Joi.string().valid('assigned', 'in_progress', 'completed', 'cancelled').required(),
});

// Только координаторы и старшие на месте могут создавать задачи
router.post('/', protect, (req, res, next) => {
    if (['coordinator', 'senior_on_site'].includes(req.user.role)) {
        next();
    } else {
        return next(new AppError('Only coordinators and senior_on_site can create tasks', 403));
    }
}, validate(createTaskSchema), createTask);

// Все участники могут получать задачи для операции
router.get('/operation/:operationId', protect, (req, res, next) => {
    if (['coordinator', 'informer', 'senior_on_site', 'group_leader', 'rescuer'].includes(req.user.role)) {
        next();
    } else {
        return next(new AppError('Not authorized to view tasks', 403));
    }
}, getTasksForOperation);

// Исполнитель или координатор/старший на месте могут обновлять статус
router.patch('/:id/status', protect, validate(updateTaskSchema), updateTaskStatus);

module.exports = router;