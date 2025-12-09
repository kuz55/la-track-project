const Joi = require('joi');
const AppError = require('../utils/errors');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return next(new AppError(`Validation Error: ${error.details[0].message}`, 400));
    }
    next();
  };
};

module.exports = validate;