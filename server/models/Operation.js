module.exports = (sequelize, DataTypes) => {
  const Operation = sequelize.define('Operation', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: DataTypes.TEXT,
    status: {
      type: DataTypes.ENUM('planning', 'active', 'closed'),
      defaultValue: 'planning',
    },
    // Поле для хранения общей геометрии зоны поиска (требует PostGIS)
    search_area: DataTypes.GEOMETRY('POLYGON'),
    // Поле для хранения общего маршрута операции (если есть)
    general_route: DataTypes.GEOMETRY('LINESTRING'),
    start_date: DataTypes.DATE,
    end_date: DataTypes.DATE,
    coordinator_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  }, {
    tableName: 'operations',
    timestamps: true,
  });

  return Operation;
};