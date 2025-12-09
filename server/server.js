// server/server.js
const app = require('./app');
const db = require('./models');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Синхронизация моделей (только для разработки!)
db.sequelize.sync({ alter: true }).then(() => {
  console.log('Database synchronized');
});

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = server;