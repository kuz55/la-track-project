module.exports = (sequelize, DataTypes) => {
  const Report = sequelize.define('Report', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('draft', 'submitted', 'reviewed'),
      defaultValue: 'draft',
    },
    // Связь с пользователем (спасатель/старший группы)
    author_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    // Связь с операцией
    operation_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'operations',
        key: 'id',
      },
    },
    // Связь с задачей (если отчёт по конкретной задаче)
    task_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'tasks',
        key: 'id',
      },
    },
  }, {
    tableName: 'reports',
    timestamps: true,
  });

  return Report;
};