module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('assigned', 'in_progress', 'completed', 'cancelled'),
      defaultValue: 'assigned',
    },
    assigned_to: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    operation_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'operations',
        key: 'id',
      },
    },
    // Связь с родительской задачей (для деления)
    parent_task_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'tasks',
        key: 'id',
      },
    },
    // Поле для хранения геометрии зоны задачи (требует PostGIS)
    geometry: DataTypes.GEOMETRY('POLYGON'), // или GEOMETRY для универсальности
    // Или маршрут задачи
    route: DataTypes.GEOMETRY('LINESTRING'),
  }, {
    tableName: 'tasks',
    timestamps: true,
  });

  return Task;
};