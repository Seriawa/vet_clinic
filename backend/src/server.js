// backend/src/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Подключаем конфигурацию БД для проверки
const db = require('./config/database');

// Базовый маршрут для проверки
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
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
// backend/src/server.js - добавьте перед app.listen()

// =============================================
// ТЕСТОВЫЕ ЭНДПОИНТЫ ДЛЯ ПРОВЕРКИ БД
// =============================================

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

// Получить все визиты
app.get('/api/test/visits', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT v.*, a.name as animal_name, u.name as veterinarian_name 
            FROM visits v 
            LEFT JOIN animals a ON v.animal_id = a.id
            LEFT JOIN users u ON v.veterinarian_id = u.id
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

// СОЗДАНИЕ (Create) - добавить животное
app.post('/api/test/animals', async (req, res) => {
    try {
        const { name, species, owner_name, owner_phone } = req.body;
        
        const result = await db.query(`
            INSERT INTO animals (name, species, owner_name, owner_phone, created_by)
            VALUES ($1, $2, $3, $4, 1)
            RETURNING *
        `, [name, species, owner_name, owner_phone]);
        
        res.json({ 
            success: true, 
            message: 'Животное создано',
            data: result.rows[0] 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ОБНОВЛЕНИЕ (Update) - обновить животное
app.put('/api/test/animals/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, species, owner_name, owner_phone } = req.body;
        
        const result = await db.query(`
            UPDATE animals 
            SET name = $1, species = $2, owner_name = $3, owner_phone = $4,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $5
            RETURNING *
        `, [name, species, owner_name, owner_phone, id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Животное не найдено' });
        }
        
        res.json({ 
            success: true, 
            message: 'Животное обновлено',
            data: result.rows[0] 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// УДАЛЕНИЕ (Delete) - удалить животное
app.delete('/api/test/animals/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await db.query('DELETE FROM animals WHERE id = $1 RETURNING id', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Животное не найдено' });
        }
        
        res.json({ 
            success: true, 
            message: 'Животное удалено',
            id: result.rows[0].id 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ПОЛУЧИТЬ КОНКРЕТНОЕ ЖИВОТНОЕ
app.get('/api/test/animals/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await db.query(`
            SELECT a.*, 
                   COUNT(v.id) as visits_count,
                   json_agg(
                       json_build_object(
                           'id', v.id,
                           'date', v.visit_date,
                           'reason', v.reason
                       ) ORDER BY v.visit_date DESC
                   ) FILTER (WHERE v.id IS NOT NULL) as visits
            FROM animals a
            LEFT JOIN visits v ON a.id = v.animal_id
            WHERE a.id = $1
            GROUP BY a.id
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Животное не найдено' });
        }
        
        res.json({ 
            success: true, 
            data: result.rows[0] 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📝 Test endpoints:`);
  console.log(`   - Health check: http://localhost:${PORT}/api/health`);
  console.log(`   - DB test: http://localhost:${PORT}/api/db-test`);
  console.log(`   - Tables list: http://localhost:${PORT}/api/tables`);
});