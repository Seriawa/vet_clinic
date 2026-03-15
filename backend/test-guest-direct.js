const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function directTest() {
    console.log('🔍 ПРЯМАЯ ПРОВЕРКА ГОСТЯ');
    console.log('='.repeat(50));
    
    try {
        // 1. Получаем гостя
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            ['guest@vetclinic.com']
        );
        
        if (result.rows.length === 0) {
            console.log('❌ Гость не найден! Создаем...');
            
            const hash = await bcrypt.hash('guest123', 10);
            const createResult = await pool.query(
                `INSERT INTO users (email, password_hash, name, role, phone, is_active) 
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                ['guest@vetclinic.com', hash, 'Guest User', 'guest', '+7 (999) 765-43-21', true]
            );
            
            console.log('✅ Гость создан!');
            console.log('   Хэш:', hash);
            console.log('   Проверка:', await bcrypt.compare('guest123', hash));
            return;
        }
        
        const user = result.rows[0];
        console.log('✅ Гость найден:');
        console.log('   ID:', user.id);
        console.log('   Email:', user.email);
        console.log('   Хэш:', user.password_hash);
        
        // 2. Пробуем разные варианты
        const passwords = ['guest123', 'guest', 'Guest123', 'password'];
        
        for (const pwd of passwords) {
            const isValid = await bcrypt.compare(pwd, user.password_hash);
            if (isValid) {
                console.log(`\n✅ Найден рабочий пароль: "${pwd}"`);
            }
        }
        
        // 3. Создаем новый хэш
        const newHash = await bcrypt.hash('guest123', 10);
        console.log('\n🔄 Новый хэш для guest123:', newHash);
        
        // 4. Обновляем принудительно
        await pool.query(
            'UPDATE users SET password_hash = $1 WHERE email = $2',
            [newHash, 'guest@vetclinic.com']
        );
        console.log('✅ Хэш обновлен!');
        
        // 5. Проверяем
        const checkValid = await bcrypt.compare('guest123', newHash);
        console.log('🔐 Проверка нового хэша:', checkValid ? '✅ РАБОТАЕТ' : '❌ НЕ РАБОТАЕТ');
        
    } catch (err) {
        console.error('❌ Ошибка:', err);
    } finally {
        await pool.end();
    }
}

directTest();