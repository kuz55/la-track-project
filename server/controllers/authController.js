const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { generateToken } = require('../utils/jwt');
const AppError = require('../utils/errors');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Проверить, что пользователь существует и пароль верный
    const user = await User.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    // 2. Сгенерировать токен
    const token = generateToken(user.id);

    // 3. Отправить токен
    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Проверить, существует ли пользователь
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return next(new AppError('User already exists with this email', 400));
    }

    // Хешировать пароль
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Создать пользователя (по умолчанию роль - заявитель)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'applicant', // Роль по умолчанию для регистрации
    });

    // Сгенерировать токен
    const token = generateToken(user.id);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, register };