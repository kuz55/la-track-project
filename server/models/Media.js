module.exports = (sequelize, DataTypes) => {
  const Media = sequelize.define('Media', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    original_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mimetype: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    size: {
      type: DataTypes.BIGINT, // Размер в байтах
    },
    // Связь с пользователем (спасатель)
    author_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    // Связь с отчётом (если прикреплено к отчёту)
    report_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'reports',
        key: 'id',
      },
    },
    // Связь с задачей
    task_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'tasks',
        key: 'id',
      },
    },
    // Связь с операцией
    operation_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'operations',
        key: 'id',
      },
    },
    // Хранение геотега как точки PostGIS
    geotag: {
      type: DataTypes.GEOMETRY('POINT'), // Тип PostGIS
    },
    description: DataTypes.TEXT, // Описание к фото/видео
  }, {
    tableName: 'media',
    timestamps: true,
  });

  return Media;
};