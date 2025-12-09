const express = require('express');
const { getAllUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Все маршруты защищены
router.use(protect);

// Только координаторы и инфорги могут просматривать
router.get('/', (req, res, next) => {
    if (['coordinator', 'informer'].includes(req.user.role)) {
        next();
    } else {
        return next(new AppError('Not authorized to view users', 403));
    }
}, getAllUsers);

router.get('/:id', (req, res, next) => {
    if (['coordinator', 'informer'].includes(req.user.role)) {
        next();
    } else {
        return next(new AppError('Not authorized to view user', 403));
    }
}, getUserById);

// Только координаторы могут изменять/удалять
router.patch('/:id', authorize('coordinator'), updateUser);
router.delete('/:id', authorize('coordinator'), deleteUser);

module.exports = router;