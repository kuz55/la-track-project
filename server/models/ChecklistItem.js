module.exports = (sequelize, DataTypes) => {
  const ChecklistItem = sequelize.define('ChecklistItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    is_completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    // Связь с конкретным чек-листом
    checklist_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'checklists',
        key: 'id',
      },
    },
    // Кто отметил выполнение (опционально)
    completed_by: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    completed_at: DataTypes.DATE,
  }, {
    tableName: 'checklist_items',
    timestamps: true,
  });

  return ChecklistItem;
};