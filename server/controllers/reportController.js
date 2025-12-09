const { Report, User, Operation, Task } = require('../models');
const AppError = require('../utils/errors');

const submitReport = async (req, res, next) => {
  try {
    const { content, operation_id, task_id } = req.body;

    // Проверка: может ли пользователь отправлять отчёты (старшие группы, спасатели)
    if (!['group_leader', 'rescuer'].includes(req.user.role)) {
      return next(new AppError('Only group leaders and rescuers can submit reports', 403));
    }

    // Проверить существование операции и задачи (если указана)
    const operation = await Operation.findByPk(operation_id);
    if (!operation) {
      return next(new AppError('Operation not found', 404));
    }

    let task = null;
    if (task_id) {
      task = await Task.findByPk(task_id);
      if (!task || task.operation_id !== operation_id) { // Проверить, что задача принадлежит операции
        return next(new AppError('Task not found or does not belong to this operation', 404));
      }
    }

    const report = await Report.create({
      content,
      author_id: req.user.id, // Автор - текущий пользователь
      operation_id,
      task_id: task ? task.id : null,
      status: 'submitted', // Устанавливаем статус "отправлен"
    });

    res.status(201).json({
      status: 'success',
      data: {
        report,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getReportsForOperation = async (req, res, next) => {
  try {
    const { operationId } = req.params; // Предположим, ID операции передаётся в URL

    // Проверка: может ли пользователь видеть отчёты (координаторы, инфорги, старшие)
    if (!['coordinator', 'informer', 'senior_on_site', 'group_leader'].includes(req.user.role)) {
      return next(new AppError('Not authorized to view reports', 403));
    }

    const reports = await Report.findAll({
      where: { operation_id: operationId },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name'],
        },
        {
          model: Task,
          as: 'task',
          attributes: ['id', 'description'],
        },
      ],
      order: [['createdAt', 'DESC']], // Отсортировать по дате создания
    });

    res.status(200).json({
      status: 'success',
      results: reports.length,
      data: {
        reports,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitReport,
  getReportsForOperation,
};