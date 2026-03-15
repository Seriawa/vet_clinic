// backend/src/config/database.js
const { Pool } = require('pg');
require('dotenv').config();

// Создаем пул соединений с базой данных
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: 20, // максимальное количество клиентов в пуле
    idleTimeoutMillis: 30000, // время простоя перед закрытием соединения
    connectionTimeoutMillis: 2000, // время ожидания соединения
});

// Проверка подключения
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    console.log('✅ Database connected successfully');
    release();
});

// Обработка ошибок
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};