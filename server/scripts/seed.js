// server/scripts/seed.js
const { User } = require('../models');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
  const email = 'admin@la-track.local';
  const password = process.env.SEED_ADMIN_PASSWORD || 'password123'; // ← пароль из .env или дефолт
  const name = 'Admin';
  const role = 'coordinator'; // или 'informer', в зависимости от ТЗ

  const existing = await User.findOne({ where: { email } });
  if (!existing) {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });
    console.log('✅ Администратор успешно создан:', email);
  } else {
    console.log('ℹ️ Администратор уже существует:', email);
  }
};

module.exports = { seedAdmin };