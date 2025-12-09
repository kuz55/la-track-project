const { User } = require('../models');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/errors');

const getAllUsers = async (req, res, next) => {
  try {
    // Только координаторы и инфорги могут просматривать список пользователей
    if (!['coordinator', 'informer'].includes(req.user.role)) {
      return next(new AppError('Not authorized to view users', 403));
    }

    // Исключаем пароли из результата
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
    });

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Только координаторы и инфорги могут просматривать пользователя
    if (!['coordinator', 'informer'].includes(req.user.role)) {
      return next(new AppError('Not authorized to view user', 403));
    }

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }, // Исключаем пароль
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body; // Допустим, координаторы/инфорги могут менять имя, email, роль

    // Только координаторы могут управлять пользователями
    if (req.user.role !== 'coordinator') {
      return next(new AppError('Only coordinators can update user details', 403));
    }

    const user = await User.findByPk(id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Проверка, пытаемся ли мы изменить роль на что-то недопустимое
    // и, возможно, проверить, что нельзя изменить роль самого себя на уровень ниже
    if (role && !['coordinator', 'informer', 'senior_on_site', 'group_leader', 'rescuer', 'applicant'].includes(role)) {
         return next(new AppError('Invalid role specified', 400));
    }

    await user.update({ name, email, role });

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Только координаторы могут удалять пользователей
    if (req.user.role !== 'coordinator') {
      return next(new AppError('Only coordinators can delete users', 403));
    }

    const user = await User.findByPk(id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Нельзя удалить самого себя
    if (user.id === req.user.id) {
        return next(new AppError('You cannot delete yourself', 400));
    }

    await user.destroy();

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};