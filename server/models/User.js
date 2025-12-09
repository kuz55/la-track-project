module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      // Добавьте валидацию длины пароля при необходимости
    },
    role: {
      type: DataTypes.ENUM('coordinator', 'informer', 'senior_on_site', 'group_leader', 'rescuer', 'applicant'),
      allowNull: false,
    },
    // Дополнительные поля, например, для связи с отрядом, если нужно
  }, {
    tableName: 'users', // Укажите имя таблицы
    timestamps: true, // Добавляет createdAt и updatedAt
  });

  return User;
};