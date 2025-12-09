const AppError = require('../utils/errors');

const importData = async (req, res, next) => {
  try {
    // Проверка прав доступа (например, координатор, инфорг)
    // Проверка файла req.file

    // Логика парсинга и импорта данных
    // await parseAndImportFile(req.file.path);

    // Пока возвращаем заглушку
    res.status(501).json({
      status: 'error',
      message: 'Import functionality is not implemented yet.',
    });

    // next(new AppError('Import functionality is not implemented yet.', 501));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  importData,
};