const Joi = require('joi');
const { Operation, User } = require('../models');
const AppError = require('../utils/errors');

// Схема валидации GeoJSON Polygon (согласно спецификации: замкнутый кольцевой контур)
const geoJsonPolygonSchema = Joi.object({
  type: Joi.string().valid('Polygon').required(),
  coordinates: Joi.array()
    .items(
      Joi.array()
        .items(
          Joi.array()
            .ordered(Joi.number().min(-180).max(180), Joi.number().min(-90).max(90))
            .length(2)
            .required()
        )
        .min(4) // Минимум 4 точки (первая = последняя — замкнутый полигон)
        .required()
    )
    .min(1) // Минимум один контур (внешнее кольцо)
    .required(),
}).required();

const createOperation = async (req, res, next) => {
  try {
    const { name, description, start_date, end_date, coordinator_id, search_area } = req.body;

    // Проверка координатора
    const coordinator = await User.findByPk(coordinator_id);
    if (!coordinator || coordinator.role !== 'coordinator') {
      return next(new AppError('Coordinator not found or invalid role', 400));
    }

    // Валидация геометрии
    if (search_area) {
      const { error } = geoJsonPolygonSchema.validate(search_area);
      if (error) {
        return next(new AppError(`Invalid search area geometry: ${error.details[0].message}`, 400));
      }
    }

    const operation = await Operation.create({
      name,
      description,
      start_date,
      end_date,
      coordinator_id,
      search_area,
      status: 'planning',
    });

    res.status(201).json({
      status: 'success',
      operation, // ← УБРАНЫ лишние скобки
    });
  } catch (error) {
    next(error);
  }
};

const updateOperation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, status, start_date, end_date, coordinator_id, search_area } = req.body;

    const operation = await Operation.findByPk(id);
    if (!operation) {
      return next(new AppError('Operation not found', 404));
    }

    // 🔒 Проверка прав: только координатор операции может её редактировать
    if (req.user.role !== 'coordinator' || req.user.id !== operation.coordinator_id) {
      return next(new AppError('You can only update operations you coordinate', 403));
    }

    // 🔒 Проверка дат (защита от bypass валидации маршрута)
    if (start_date && end_date) {
      const start = new Date(start_date);
      const end = new Date(end_date);
      if (end <= start) {
        return next(new AppError('End date must be after start date', 400));
      }
    }

    // Валидация геометрии (если передана)
    if (search_area) {
      const { error } = geoJsonPolygonSchema.validate(search_area);
      if (error) {
        return next(new AppError(`Invalid search area geometry: ${error.details[0].message}`, 400));
      }
    }

    await operation.update({
      name,
      description,
      status,
      start_date,
      end_date,
      coordinator_id,
      search_area,
    });

    res.status(200).json({
      status: 'success',
      operation,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOperation,
  updateOperation,
};