// server/app.js
const express = require('express');
const cors = require('cors');
const winston = require('winston');
require('dotenv').config();

const db = require('./models');

// Routes
const authRoutes = require('./routes/auth');
const operationsRoutes = require('./routes/operations');
const requestsRoutes = require('./routes/requests');
const reportsRoutes = require('./routes/reports');
const tasksRoutes = require('./routes/tasks');
const positionsRoutes = require('./routes/positions');
const mediaRoutes = require('./routes/media');
const usersRoutes = require('./routes/users');
const checklistsRoutes = require('./routes/checklists');
const emergencyRoutes = require('./routes/emergency');
const pushRoutes = require('./routes/push');

const app = express();

// Logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({ format: winston.format.simple() }));
}

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/operations', operationsRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/positions', positionsRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/checklists', checklistsRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/push', pushRoutes);

// 404 handler
app.all('*', (req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  err.statusCode = 404;
  err.status = 'fail';
  next(err);
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

module.exports = app;