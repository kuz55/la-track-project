module.exports = (sequelize, DataTypes) => {
  const Request = sequelize.define('Request', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    missing_person_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date_missing: {
      type: DataTypes.DATEONLY, // Только дата
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING, // Можно заменить на GEOMETRY, если нужно хранить точку
      allowNull: false,
    },
    description: DataTypes.TEXT,
    status: {
      type: DataTypes.ENUM('new', 'in_progress', 'closed'),
      defaultValue: 'new',
    },
    // Связь с пользователем-заявителем
    applicant_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    // Связь с операцией (если заявка привела к операции)
    operation_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'operations',
        key: 'id',
      },
    },
  }, {
    tableName: 'requests',
    timestamps: true,
  });

  return Request;
};