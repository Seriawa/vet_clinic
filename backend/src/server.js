// backend/src/server.js
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DB + модели + мидлвары
const db = require('./config/database');
const userModel = require('./models/userModel');
const animalModel = require('./models/animalModel');
const { auth, requireAdmin } = require('./middleware/auth');

// Базовый маршрут для проверки
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Вход
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email и пароль обязательны' });
  }

  try {
    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Неверный email или пароль' });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ success: false, message: 'Неверный email или пароль' });
    }

    await userModel.updateLastLogin(user.id);

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    );

    const { password_hash, ...safeUser } = user;

    res.json({ success: true, token, user: safeUser });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

// Регистрация
app.post('/api/auth/register', async (req, res) => {
  const { name, email, phone, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Имя, email и пароль обязательны' });
  }

  try {
    const existing = await userModel.findByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Пользователь с таким email уже существует' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const newUser = await userModel.create({ name, email, phone, password_hash, role: 'guest' });

    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    );

    res.status(201).json({ success: true, token, user: newUser });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

// Профиль по токену
app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Пользователь не найден' });
    }
    res.json({
      success: true,
      user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

// Маршрут для проверки подключения к БД
app.get('/api/db-test', async (req, res) => {
  try {
    // Пробуем выполнить простой запрос
    const result = await db.query('SELECT NOW() as current_time');
    
    res.json({ 
      success: true, 
      message: 'Database connection successful',
      time: result.rows[0].current_time
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Database connection failed',
      error: error.message 
    });
  }
});

// Маршрут для проверки таблиц
app.get('/api/tables', async (req, res) => {
  try {
    const query = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    const result = await db.query(query);
    
    res.json({ 
      success: true, 
      tables: result.rows.map(row => row.table_name)
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get tables',
      error: error.message 
    });
  }
});

// Получить всех пользователей
app.get('/api/test/users', async (req, res) => {
    try {
        const result = await db.query('SELECT id, email, name, role, created_at FROM users');
        res.json({ 
            success: true, 
            count: result.rows.length,
            data: result.rows 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Получить всех животных
app.get('/api/test/animals', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT a.*, u.name as created_by_name 
            FROM animals a 
            LEFT JOIN users u ON a.created_by = u.id
        `);
        res.json({ 
            success: true, 
            count: result.rows.length,
            data: result.rows 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Получить все визиты (тестовый эндпоинт)
app.get('/api/test/visits', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT v.*, a.name as animal_name, u.name as veterinarian_name 
      FROM visits v 
      LEFT JOIN animals a ON v.animal_id = a.id
      LEFT JOIN users u ON v.veterinarian_id = u.id
      ORDER BY v.visit_date DESC
    `);
    res.json({ 
      success: true, 
      count: result.rows.length,
      data: result.rows 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Список животных
app.get('/api/animals', auth, async (req, res) => {
  try {
    const animals = await animalModel.findAll();
    res.json({ success: true, data: animals });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Не удалось получить животных', error: error.message });
  }
});

// Конкретное животное
app.get('/api/animals/:id', auth, async (req, res) => {
  try {
    const animal = await animalModel.findById(req.params.id);
    if (!animal) {
      return res.status(404).json({ success: false, message: 'Животное не найдено' });
    }
    res.json({ success: true, data: animal });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Не удалось получить животное', error: error.message });
  }
});

// СОЗДАНИЕ (Create) - добавить животное
app.post('/api/animals', auth, requireAdmin, async (req, res) => {
    try {
        const created = await animalModel.create(req.body, req.user.id);
        res.status(201).json({ success: true, message: 'Животное создано', data: created });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ОБНОВЛЕНИЕ (Update) - обновить животное
app.put('/api/animals/:id', auth, requireAdmin, async (req, res) => {
    try {
        const updated = await animalModel.update(req.params.id, req.body, req.user.id);
        if (!updated) {
          return res.status(404).json({ success: false, message: 'Животное не найдено' });
        }
        res.json({ success: true, message: 'Животное обновлено', data: updated });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// УДАЛЕНИЕ (Delete) - удалить животное
app.delete('/api/animals/:id', auth, requireAdmin, async (req, res) => {
    try {
        const deleted = await animalModel.delete(req.params.id);
        if (!deleted) {
          return res.status(404).json({ success: false, message: 'Животное не найдено' });
        }
        res.json({ success: true, message: 'Животное удалено', id: deleted.id });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Список всех визитов (для страницы "Визиты")
app.get('/api/visits', auth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        v.*,
        a.name AS animal_name,
        a.species AS animal_species,
        u.name AS veterinarian_name
      FROM visits v
      LEFT JOIN animals a ON v.animal_id = a.id
      LEFT JOIN users u ON v.veterinarian_id = u.id
      ORDER BY v.visit_date DESC, v.created_at DESC
    `);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Не удалось получить визиты', error: error.message });
  }
});

// Получить один визит по id (деталка по визиту, при необходимости)
app.get('/api/visits/:id', auth, async (req, res) => {
  try {
    const result = await db.query(
      `
      SELECT 
        v.*,
        a.name AS animal_name,
        a.species AS animal_species,
        u.name AS veterinarian_name
      FROM visits v
      LEFT JOIN animals a ON v.animal_id = a.id
      LEFT JOIN users u ON v.veterinarian_id = u.id
      WHERE v.id = $1
    `,
      [req.params.id],
    );

    if (!result.rows[0]) {
      return res.status(404).json({ success: false, message: 'Визит не найден' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Не удалось получить визит', error: error.message });
  }
});

// Создание визита (таблица: visit_date DATE, visit_time TIME — оба NOT NULL; visit_type, reason и др.)
app.post('/api/visits', auth, requireAdmin, async (req, res) => {
  const {
    animal_id,
    visit_date,
    visit_time,
    visit_datetime,
    visit_type,
    reason,
    diagnosis,
    treatment,
    symptoms,
  } = req.body || {};

  if (!animal_id || !reason) {
    return res.status(400).json({
      success: false,
      message: 'animal_id и reason обязательны',
    });
  }

  let dateVal = visit_date;
  let timeVal = visit_time;
  if (visit_datetime) {
    const d = new Date(visit_datetime);
    if (isNaN(d.getTime())) {
      return res.status(400).json({ success: false, message: 'Некорректная дата/время визита' });
    }
    dateVal = d.toISOString().slice(0, 10);
    timeVal = d.toTimeString().slice(0, 8);
  }
  if (!dateVal || !timeVal) {
    return res.status(400).json({
      success: false,
      message: 'Укажите дату и время визита (visit_date + visit_time или visit_datetime)',
    });
  }

  try {
    const result = await db.query(
      `
      INSERT INTO visits (
        animal_id,
        visit_date,
        visit_time,
        visit_type,
        reason,
        diagnosis,
        treatment,
        symptoms,
        veterinarian_id
      )
      VALUES ($1, $2::date, $3::time, COALESCE($4, 'regular'), $5, $6, $7, $8, $9)
      RETURNING *
    `,
      [
        animal_id,
        dateVal,
        timeVal,
        visit_type || 'regular',
        reason,
        diagnosis || null,
        treatment || null,
        symptoms || null,
        req.user.id,
      ],
    );

    res.status(201).json({
      success: true,
      message: 'Визит создан',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Create visit error:', error);
    res.status(500).json({ success: false, message: 'Не удалось создать визит', error: error.message });
  }
});

// Обновление визита (visit_date, visit_time, visit_type, reason, diagnosis, treatment)
app.put('/api/visits/:id', auth, requireAdmin, async (req, res) => {
  const {
    visit_date,
    visit_time,
    visit_datetime,
    visit_type,
    reason,
    diagnosis,
    treatment,
    symptoms,
  } = req.body || {};

  let dateVal = visit_date;
  let timeVal = visit_time;
  if (visit_datetime) {
    const d = new Date(visit_datetime);
    if (!isNaN(d.getTime())) {
      dateVal = d.toISOString().slice(0, 10);
      timeVal = d.toTimeString().slice(0, 8);
    }
  }

  try {
    const result = await db.query(
      `
      UPDATE visits
      SET
        visit_date = COALESCE($1::date, visit_date),
        visit_time = COALESCE($2::time, visit_time),
        visit_type = COALESCE($3, visit_type),
        reason = COALESCE($4, reason),
        diagnosis = COALESCE($5, diagnosis),
        treatment = COALESCE($6, treatment),
        symptoms = COALESCE($7, symptoms),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `,
      [
        dateVal || null,
        timeVal || null,
        visit_type || null,
        reason || null,
        diagnosis || null,
        treatment || null,
        symptoms || null,
        req.params.id,
      ],
    );

    if (!result.rows[0]) {
      return res.status(404).json({ success: false, message: 'Визит не найден' });
    }

    res.json({
      success: true,
      message: 'Визит обновлён',
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Не удалось обновить визит', error: error.message });
  }
});

// Удаление визита
app.delete('/api/visits/:id', auth, requireAdmin, async (req, res) => {
  try {
    const result = await db.query(
      `
      DELETE FROM visits
      WHERE id = $1
      RETURNING id
    `,
      [req.params.id],
    );

    if (!result.rows[0]) {
      return res.status(404).json({ success: false, message: 'Визит не найден' });
    }

    res.json({
      success: true,
      message: 'Визит удалён',
      id: result.rows[0].id,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Не удалось удалить визит', error: error.message });
  }
});

// Календарь визитов (для страницы "Календарь")
// Параметры: from, to (ISO-датa), необязательные
app.get('/api/calendar/visits', auth, async (req, res) => {
  const { from, to } = req.query;

  const conditions = [];
  const values = [];

  if (from) {
    values.push(from);
    conditions.push(`v.visit_date >= $${values.length}`);
  }

  if (to) {
    values.push(to);
    conditions.push(`v.visit_date <= $${values.length}`);
  }

  const whereSql = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const result = await db.query(
      `
      SELECT 
        v.id,
        v.visit_date,
        v.visit_time,
        v.visit_type AS status,
        v.reason,
        a.id AS animal_id,
        a.name AS animal_name,
        a.species AS animal_species
      FROM visits v
      LEFT JOIN animals a ON v.animal_id = a.id
      ${whereSql}
      ORDER BY v.visit_date ASC
    `,
      values,
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Не удалось получить календарь визитов', error: error.message });
  }
});


app.get('/api/statistics/summary', auth, async (req, res) => {
  try {
    const [animalsCount, visitsCount, visitsByStatus, animalsBySpecies] = await Promise.all([
      db.query('SELECT COUNT(*)::int AS total_animals FROM animals'),
      db.query('SELECT COUNT(*)::int AS total_visits FROM visits'),
      db.query(`
        SELECT COALESCE(visit_type, 'unknown') AS status, COUNT(*)::int AS count
        FROM visits
        GROUP BY COALESCE(visit_type, 'unknown')
      `),
      db.query(`
        SELECT COALESCE(species, 'unknown') AS species, COUNT(*)::int AS count
        FROM animals
        GROUP BY COALESCE(species, 'unknown')
      `),
    ]);

    res.json({
      success: true,
      data: {
        total_animals: animalsCount.rows[0]?.total_animals ?? 0,
        total_visits: visitsCount.rows[0]?.total_visits ?? 0,
        visits_by_status: visitsByStatus.rows,
        animals_by_species: animalsBySpecies.rows,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Не удалось получить статистику', error: error.message });
  }
});


app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📝 Test endpoints:`);
  console.log(`   - Health check: http://localhost:${PORT}/api/health`);
  console.log(`   - DB test: http://localhost:${PORT}/api/db-test`);
  console.log(`   - Tables list: http://localhost:${PORT}/api/tables`);
});