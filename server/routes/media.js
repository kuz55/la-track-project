const express = require('express');
const { uploadMedia, getMediaForOperation, uploadSingleMedia } = require('../controllers/mediaController');
const { protect } = require('../middleware/auth');
const AppError = require('../utils/errors');

const router = express.Router();

// Только полевые сотрудники могут загружать
router.post('/', protect, (req, res, next) => {
    if (['senior_on_site', 'group_leader', 'rescuer'].includes(req.user.role)) {
        next();
    } else {
        return next(new AppError('Only field personnel can upload media', 403));
    }
}, uploadSingleMedia, uploadMedia);

// Все участники могут получать медиа для операции
router.get('/operation/:operationId', protect, (req, res, next) => {
    if (['coordinator', 'informer', 'senior_on_site', 'group_leader', 'rescuer'].includes(req.user.role)) {
        next();
    } else {
        return next(new AppError('Not authorized to view media', 403));
    }
}, getMediaForOperation);

module.exports = router;