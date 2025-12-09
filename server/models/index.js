// server/models/index.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: false,
  }
);

// Импортируем все модели, передавая DataTypes
const { DataTypes } = sequelize.Sequelize;

const User = require('./User')(sequelize, DataTypes);
const PushSubscription = require('./PushSubscription')(sequelize, DataTypes);
const Operation = require('./Operation')(sequelize, DataTypes);
const Request = require('./Request')(sequelize, DataTypes);
const Report = require('./Report')(sequelize, DataTypes);
const Task = require('./Task')(sequelize, DataTypes);
const Position = require('./Position')(sequelize, DataTypes);
const Media = require('./Media')(sequelize, DataTypes);
const Checklist = require('./Checklist')(sequelize, DataTypes);
const ChecklistItem = require('./ChecklistItem')(sequelize, DataTypes);

// Ассоциации
PushSubscription.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(PushSubscription, { foreignKey: 'user_id' });

Operation.belongsTo(User, { as: 'coordinator', foreignKey: 'coordinator_id' });
User.hasMany(Operation, { as: 'coordinatedOperations', foreignKey: 'coordinator_id' });

Request.belongsTo(User, { as: 'applicant', foreignKey: 'applicant_id' });
User.hasMany(Request, { as: 'requests', foreignKey: 'applicant_id' });

Task.belongsTo(Operation, { foreignKey: 'operation_id' });
Operation.hasMany(Task, { foreignKey: 'operation_id' });

Task.belongsTo(User, { as: 'assignee', foreignKey: 'assigned_to' });
User.hasMany(Task, { as: 'assignedTasks', foreignKey: 'assigned_to' });

Position.belongsTo(User, { foreignKey: 'user_id' });
Position.belongsTo(Operation, { foreignKey: 'operation_id' });

Media.belongsTo(User, { as: 'author', foreignKey: 'author_id' });
Media.belongsTo(Operation, { foreignKey: 'operation_id' });
Media.belongsTo(Task, { foreignKey: 'task_id', allowNull: true });
Media.belongsTo(Report, { foreignKey: 'report_id', allowNull: true });

Checklist.belongsTo(Task, { foreignKey: 'task_id', allowNull: true });
Checklist.belongsTo(Operation, { foreignKey: 'operation_id', allowNull: true });
Task.hasOne(Checklist, { foreignKey: 'task_id' });
Operation.hasOne(Checklist, { foreignKey: 'operation_id' });

ChecklistItem.belongsTo(Checklist, { foreignKey: 'checklist_id' });
Checklist.hasMany(ChecklistItem, { foreignKey: 'checklist_id' });

ChecklistItem.belongsTo(User, { as: 'completer', foreignKey: 'completed_by', allowNull: true });

module.exports = {
  sequelize,
  Sequelize,
  User,
  PushSubscription,
  Operation,
  Request,
  Report,
  Task,
  Position,
  Media,
  Checklist,
  ChecklistItem,
};