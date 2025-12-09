const { Request, User, Operation } = require('../models');
const AppError = require('../utils/errors');

// Вспомогательная функция (можно оставить, но необязательно)
const updateRequestStatusToInProgress = async (requestId) => {
  await Request.update(
    { status: 'in_progress' },
    { where: { id: requestId } }
  );
};

const getAllRequests = async (req, res, next) => {
  try {
    let whereClause = {};
    if (req.user.role === 'applicant') {
      whereClause.applicant_id = req.user.id;
    }

    const requests = await Request.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'applicant', attributes: ['id', 'name', 'email'] },
        { model: Operation, as: 'operation', attributes: ['id', 'name', 'status'] },
      ],
    });

    res.status(200).json({
      status: 'success',
      results: requests.length,
      data: { requests },
    });
  } catch (error) {
    next(error);
  }
};

const getRequestById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const request = await Request.findByPk(id, {
      include: [
        { model: User, as: 'applicant', attributes: ['id', 'name', 'email'] },
        { model: Operation, as: 'operation', attributes: ['id', 'name', 'status'] },
      ],
    });

    if (!request) {
      return next(new AppError('Request not found', 404));
    }

    if (req.user.role === 'applicant' && request.applicant_id !== req.user.id) {
      return next(new AppError('Not authorized to view this request', 403));
    }

    res.status(200).json({
      status: 'success',
      data: { request },
    });
  } catch (error) {
    next(error);
  }
};

const updateRequestStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const request = await Request.findByPk(id);
    if (!request) {
      return next(new AppError('Request not found', 404));
    }

    if (req.user.role !== 'informer') {
      return next(new AppError('Only informers can update request status', 403));
    }

    await request.update({ status });

    res.status(200).json({
      status: 'success',
      data: { request },
    });
  } catch (error) {
    next(error);
  }
};

const linkRequestToOperation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { operation_id } = req.body;

    const request = await Request.findByPk(id);
    const operation = await Operation.findByPk(operation_id);

    if (!request || !operation) {
      return next(new AppError('Request or Operation not found', 404));
    }

    if (req.user.role !== 'informer' && req.user.role !== 'coordinator') {
      return next(new AppError('Not authorized to link request to operation', 403));
    }

    // Обновляем всё за один запрос
    await request.update({
      operation_id,
      status: 'in_progress',
    });

    res.status(200).json({
      status: 'success',
      message: 'Request linked to operation and status updated to in_progress',
      data: { request },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRequests,
  getRequestById,
  updateRequestStatus,
  linkRequestToOperation,
};