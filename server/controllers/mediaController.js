const { Media, User, Report, Task, Operation } = require('../models');
const AppError = require('../utils/errors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Настройка Multer для сохранения файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Папка для загрузки
    const uploadDir = 'uploads/media/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Генерация уникального имени файла
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Фильтр файлов (только изображения/видео)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image or video! Please upload only images or videos.', 400), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB лимит
  }
});

const uploadMedia = async (req, res, next) => {
  try {
    // Проверка: только полевые сотрудники могут загружать медиа
    if (!['senior_on_site', 'group_leader', 'rescuer'].includes(req.user.role)) {
      return next(new AppError('Only field personnel can upload media', 403));
    }

    if (!req.file) {
      return next(new AppError('No file uploaded', 400));
    }

    const { report_id, task_id, operation_id, description, geotag } = req.body;

    // Проверка обязательных полей (operation_id или report_id/task_id)
    if (!operation_id) {
      return next(new AppError('Operation ID is required', 400));
    }

    // Проверить существование связанных сущностей
    let operation = null;
    let report = null;
    let task = null;

    operation = await Operation.findByPk(operation_id);
    if (!operation) {
      return next(new AppError('Operation not found', 404));
    }

    if (report_id) {
      report = await Report.findByPk(report_id);
      if (!report || report.operation_id !== operation_id) {
        return next(new AppError('Report not found or does not belong to this operation', 404));
      }
    }

    if (task_id) {
      task = await Task.findByPk(task_id);
      if (!task || task.operation_id !== operation_id) {
        return next(new AppError('Task not found or does not belong to this operation', 404));
      }
    }

    const media = await Media.create({
      filename: req.file.filename,
      original_name: req.file.originalname,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
      author_id: req.user.id,
      report_id: report ? report.id : null,
      task_id: task ? task.id : null,
      operation_id: operation.id,
      description: description || null,
      geotag: geotag || null, // Sequelize/PostGIS обработает GeoJSON
    });

    res.status(201).json({
      status: 'success',
      data: {
        media,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMediaForOperation = async (req, res, next) => {
  try {
    const { operationId } = req.params;

    // Проверка: может ли пользователь видеть медиа
    if (!['coordinator', 'informer', 'senior_on_site', 'group_leader', 'rescuer'].includes(req.user.role)) {
      return next(new AppError('Not authorized to view media', 403));
    }

    const media = await Media.findAll({
      where: { operation_id: operationId },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name'],
        },
        {
          model: Report,
          as: 'report',
          attributes: ['id'],
        },
        {
          model: Task,
          as: 'task',
          attributes: ['id'],
        },
      ],
      order: [['createdAt', 'DESC']], // Отсортировать по дате создания
    });

    res.status(200).json({
      status: 'success',
      results: media.length,
      data: {
        media,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Middleware для загрузки файла
const uploadSingleMedia = upload.single('media');

module.exports = {
  uploadMedia,
  getMediaForOperation,
  uploadSingleMedia, // Экспортируем middleware
};