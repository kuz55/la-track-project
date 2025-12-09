const jwt = require('jsonwebtoken');
const AppError = require('./errors');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_jwt_secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d', // Используем переменную окружения
  });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      throw new AppError('Invalid or expired token', 401);
    }
    throw error; // Перебросить другие ошибки
  }
};

module.exports = { generateToken, verifyToken };