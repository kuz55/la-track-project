const { Task, User, Operation } = require('../models');
const AppError = require('../utils/errors');

const createTask = async (req, res, next) => {
  try {
    const { description, operation_id, assigned_to } = req.body;

    // Проверка: только координаторы или старшие на месте могут создавать задачи
    if (!['coordinator', 'senior_on_site'].includes(req.user.role)) {
      return next(new AppError('Only coordinators and senior_on_site can create tasks', 403));
    }

    // Проверить, что операция существует
    const operation = await Operation.findByPk(operation_id);
    if (!operation) {
      return next(new AppError('Operation not found', 404));
    }

    // Проверить, что назначаемый пользователь существует
    let assignee = null;
    if (assigned_to) {
      assignee = await User.findByPk(assigned_to);
      if (!assignee) {
        return next(new AppError('Assigned user not found', 404));
      }
    }

    const task = await Task.create({
      description,
      operation_id,
      assigned_to: assignee ? assignee.id : null,
      status: 'assigned', // Устанавливаем начальный статус
    });

    res.status(201).json({
      status: 'success',
      data: {
        task,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getTasksForOperation = async (req, res, next) => {
  try {
    const { operationId } = req.params;

    // Проверка: может ли пользователь видеть задачи
    if (!['coordinator', 'informer', 'senior_on_site', 'group_leader', 'rescuer'].includes(req.user.role)) {
      return next(new AppError('Not authorized to view tasks', 403));
    }

    const tasks = await Task.findAll({
      where: { operation_id: operationId },
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name'],
        },
      ],
    });

    res.status(200).json({
      status: 'success',
      results: tasks.length,
      data: {
        tasks,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateTaskStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // assigned, in_progress, completed, cancelled

    const task = await Task.findByPk(id);

    if (!task) {
      return next(new AppError('Task not found', 404));
    }

    // Проверка: может ли текущий пользователь обновить задачу
    // Спасатель может обновить только свою задачу
    // Старший группы может обновить задачи своей группы (нужно связать группу -> пользователей)
    // Пока упрощённо: только исполнитель или координатор/старший на месте
    if (req.user.id !== task.assigned_to && !['coordinator', 'senior_on_site'].includes(req.user.role)) {
        return next(new AppError('Not authorized to update this task status', 403));
    }

    await task.update({ status });

    res.status(200).json({
      status: 'success',
      data: {
        task,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasksForOperation,
  updateTaskStatus,
};