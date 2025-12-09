module.exports = (sequelize, DataTypes) => {
  const Checklist = sequelize.define('Checklist', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: DataTypes.TEXT,
    // Связь с задачей, для которой создан чек-лист (если применимо)
    task_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'tasks',
        key: 'id',
      },
    },
    // Связь с операцией, если чек-лист общий для операции
    operation_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'operations',
        key: 'id',
      },
    },
    // Статус выполнения всего чек-листа (опционально)
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed'),
      defaultValue: 'pending',
    },
  }, {
    tableName: 'checklists',
    timestamps: true,
  });

  return Checklist;
};