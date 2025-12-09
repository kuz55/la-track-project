const { Checklist, ChecklistItem, Task, Operation, User } = require('../models');
const AppError = require('../utils/errors');

const createChecklist = async (req, res, next) => {
  try {
    const { title, description, task_id, operation_id, items } = req.body;

    // Проверка: только старшие на месте, старшие групп или координаторы могут создавать чек-листы
    if (!['coordinator', 'senior_on_site', 'group_leader'].includes(req.user.role)) {
      return next(new AppError('Not authorized to create checklists', 403));
    }

    let targetOperation = null;
    let targetTask = null;

    if (task_id) {
      targetTask = await Task.findByPk(task_id);
      if (!targetTask) {
        return next(new AppError('Task not found', 404));
      }
      targetOperation = await Operation.findByPk(targetTask.operation_id);
    } else if (operation_id) {
      targetOperation = await Operation.findByPk(operation_id);
      if (!targetOperation) {
        return next(new AppError('Operation not found', 404));
      }
    } else {
      return next(new AppError('Either task_id or operation_id must be provided', 400));
    }

    const checklist = await Checklist.create({
      title,
      description,
      task_id: targetTask ? targetTask.id : null,
      operation_id: targetOperation ? targetOperation.id : null,
    });

    if (items && Array.isArray(items) && items.length > 0) {
      const checklistItemsToCreate = items.map(item => ({
        description: item.description,
        checklist_id: checklist.id,
      }));
      await ChecklistItem.bulkCreate(checklistItemsToCreate);
    }

    // Подгрузим созданные элементы
    const checklistWithItems = await Checklist.findByPk(checklist.id, {
      include: [
        {
          model: ChecklistItem,
          as: 'checklist_items',
          include: [
            {
              model: User,
              as: 'completer',
              attributes: ['id', 'name'],
            }
          ]
        }
      ]
    });

    res.status(201).json({
      status: 'success',
      checklist: checklistWithItems,
    });

  } catch (error) {
    next(error);
  }
};

const getChecklistById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const checklist = await Checklist.findByPk(id, {
      include: [
        {
          model: ChecklistItem,
          as: 'checklist_items',
          include: [
            {
              model: User,
              as: 'completer',
              attributes: ['id', 'name'],
            }
          ]
        }
      ]
    });

    if (!checklist) {
      return next(new AppError('Checklist not found', 404));
    }

    let hasAccess = false;
    if (checklist.task_id) {
      const task = await Task.findByPk(checklist.task_id);
      if (task) {
        if (['coordinator', 'senior_on_site', 'group_leader', 'rescuer'].includes(req.user.role)) {
          hasAccess = true;
        }
      }
    } else if (checklist.operation_id) {
      if (['coordinator', 'senior_on_site', 'group_leader', 'rescuer', 'informer'].includes(req.user.role)) {
        hasAccess = true;
      }
    }

    if (!hasAccess) {
      return next(new AppError('Not authorized to view this checklist', 403));
    }

    res.status(200).json({
      status: 'success',
      data: {
        checklist,
      },
    });

  } catch (error) {
    next(error);
  }
};

const updateChecklistItem = async (req, res, next) => {
  try {
    const { checklistId, itemId } = req.params;
    const { is_completed } = req.body;

    // Проверка: только полевые сотрудники могут обновлять элементы чек-листа
    if (!['senior_on_site', 'group_leader', 'rescuer'].includes(req.user.role)) {
      return next(new AppError('Only field personnel can update checklist items', 403));
    }

    const item = await ChecklistItem.findOne({
      where: { id: itemId, checklist_id: checklistId }
    });

    if (!item) {
      return next(new AppError('Checklist item not found', 404));
    }

    await item.update({
      is_completed,
      completed_by: is_completed ? req.user.id : null,
      completed_at: is_completed ? new Date() : null,
    });

    const updatedItem = await ChecklistItem.findByPk(itemId, {
      include: [
        {
          model: User,
          as: 'completer',
          attributes: ['id', 'name'],
        }
      ]
    });

    res.status(200).json({
      status: 'success',
      item: updatedItem,
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  createChecklist,
  getChecklistById,
  updateChecklistItem,
};