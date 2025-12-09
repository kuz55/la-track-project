// server/routes/operations.js
const express = require('express');
const { createOperation, updateOperation } = require('../controllers/operationController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const Joi = require('joi');

const router = express.Router();

// Схема валидации GeoJSON Polygon
const geoJsonPolygonSchema = Joi.object({
  type: Joi.string().valid('Polygon').required(),
  coordinates: Joi.array()
    .items(
      Joi.array()
        .items(
          Joi.array()
            .items(Joi.number().required())
            .length(2) // [lng, lat]
        )
        .min(4) // замкнутый полигон
    )
    .min(1)
    .required(),
}).optional();

const createOperationSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional(),
  start_date: Joi.date().iso().required(),
  end_date: Joi.date().iso().greater(Joi.ref('start_date')).required(),
  coordinator_id: Joi.number().integer().required(),
  search_area: geoJsonPolygonSchema,
});

const updateOperationSchema = Joi.object({
  name: Joi.string().optional(),
  description: Joi.string().optional(),
  status: Joi.string().valid('planning', 'active', 'closed').optional(),
  start_date: Joi.date().iso().optional(),
  end_date: Joi.date().iso().greater(Joi.ref('start_date')).optional(),
  coordinator_id: Joi.number().integer().optional(),
  search_area: geoJsonPolygonSchema,
});

// Только координаторы могут создавать операции
router.post(
  '/',
  protect,
  authorize('coordinator'),
  validate(createOperationSchema),
  createOperation
);

// Только координаторы могут обновлять операции
router.patch(
  '/:id',
  protect,
  authorize('coordinator'),
  validate(updateOperationSchema),
  updateOperation
);

// Все авторизованные могут просматривать операции (ограничения — в контроллере)
router.get('/', protect, async (req, res, next) => {
  // В контроллере — логика фильтрации по роли
  const { getAllOperations } = require('../controllers/operationController');
  getAllOperations(req, res, next);
});

router.get('/:id', protect, async (req, res, next) => {
  const { getOperationById } = require('../controllers/operationController');
  getOperationById(req, res, next);
});

// 🔑 Обязательно экспортируем маршрутизатор
module.exports = router;