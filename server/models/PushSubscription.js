module.exports = (sequelize, DataTypes) => {
  const PushSubscription = sequelize.define('PushSubscription', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // Связь с пользователем, которому принадлежит подписка
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE', // Удалить подписку, если пользователь удалён
    },
    // Уникальный endpoint, предоставленный браузером/устройством
    endpoint: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Endpoint должен быть уникальным
    },
    // Ключи для шифрования (auth, p256dh)
    p256dh: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    auth: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // Для мобильных приложений может быть токен FCM
    fcm_token: {
      type: DataTypes.STRING,
      allowNull: true, // Может быть null для веб-браузеров
    },
    // Для каких операций/событий подписка активна (опционально)
    // scope: {
    //   type: DataTypes.STRING, // например, 'all', 'operation_123'
    //   defaultValue: 'all'
    // },
  }, {
    tableName: 'push_subscriptions',
    timestamps: true, // Добавляет createdAt и updatedAt
  });

  return PushSubscription;
};