const express = require('express');
const {
  getAllRequests,
  getRequestById,
  updateRequestStatus,
  linkRequestToOperation,
} = require('../controllers/requestController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const Joi = require('joi');

const router = express.Router();

const updateRequestSchema = Joi.object({
  status: Joi.string().valid('new', 'in_progress', 'closed').required(),
});

const linkRequestSchema = Joi.object({
  operation_id: Joi.number().integer().required(),
});

// Все маршруты защищены
router.use(protect);

// Заявитель может просматривать свои заявки
router.get('/', (req, res, next) => {
  if (req.user.role === 'applicant') {
    // Разрешить доступ без дополнительной авторизации
    return next();
  }
  // Инфорги и координаторы проходят дальше
  authorize('informer', 'coordinator')(req, res, next);
});

router.get('/:id', (req, res, next) => {
  if (req.user.role === 'applicant') {
    // Разрешить доступ без дополнительной авторизации
    return next();
  }
  // Инфорги и координаторы проходят дальше
  authorize('informer', 'coordinator')(req, res, next);
});

// Только инфорги могут обновлять статус
router.patch('/:id/status', authorize('informer'), validate(updateRequestSchema), updateRequestStatus);

// Только инфорги/координаторы могут связывать с операцией
router.patch('/:id/link', authorize('informer', 'coordinator'), validate(linkRequestSchema), linkRequestToOperation);

module.exports = router;