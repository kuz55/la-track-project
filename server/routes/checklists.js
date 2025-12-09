const express = require('express');
const { createChecklist, getChecklistById, updateChecklistItem } = require('../controllers/checklistController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const Joi = require('joi');
const AppError = require('../utils/errors');

const router = express.Router();

const createChecklistSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().optional(),
  task_id: Joi.number().integer().optional(),
  operation_id: Joi.number().integer().optional(),
  items: Joi.array().items(
    Joi.object({
        description: Joi.string().required(),
    })
  ).optional(),
}).xor('task_id', 'operation_id'); // Только одно из них должно быть указано

const updateChecklistItemSchema = Joi.object({
  is_completed: Joi.boolean().required(),
});

// Только старшие могут создавать чек-листы
router.post('/', protect, (req, res, next) => {
    if (['coordinator', 'senior_on_site', 'group_leader'].includes(req.user.role)) {
        next();
    } else {
        return next(new AppError('Only coordinators, senior_on_site, and group_leaders can create checklists', 403));
    }
}, validate(createChecklistSchema), createChecklist);

// Доступ к чек-листу зависит от связей (реализовано в контроллере)
router.get('/:id', protect, getChecklistById);

// Только полевые сотрудники могут обновлять элементы
router.patch('/:checklistId/items/:itemId', protect, (req, res, next) => {
    if (['senior_on_site', 'group_leader', 'rescuer'].includes(req.user.role)) {
        next();
    } else {
        return next(new AppError('Only field personnel can update checklist items', 403));
    }
}, validate(updateChecklistItemSchema), updateChecklistItem);

module.exports = router;