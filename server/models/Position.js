module.exports = (sequelize, DataTypes) => {
  const Position = sequelize.define('Position', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    location: {
      type: DataTypes.GEOMETRY('POINT'),
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    accuracy: {
      type: DataTypes.FLOAT,
    },
    synced: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    // Новое поле: флаг экстренного сигнала
    is_emergency: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
  }, {
    tableName: 'positions',
    timestamps: true,
  });

  return Position;
};