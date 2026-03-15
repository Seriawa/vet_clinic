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

async function testPassword() {
    try {
        // Получаем пользователя из БД
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            ['admin@vetclinic.com']
        );
        
        if (result.rows.length === 0) {
            console.log('❌ Пользователь не найден');
            return;
        }
        
        const user = result.rows[0];
        console.log('✅ Пользователь найден:');
        console.log('   Email:', user.email);
        console.log('   Role:', user.role);
        console.log('   Hash:', user.password_hash ? 'есть' : 'нет');
        
        if (!user.password_hash) {
            console.log('❌ Хэш пароля отсутствует!');
            return;
        }
        
        // Тестируем пароль
        const testPassword = 'admin123';
        const isValid = await bcrypt.compare(testPassword, user.password_hash);
        
        console.log(`\n🔐 Тест пароля '${testPassword}':`, isValid ? '✅ ВЕРНЫЙ' : '❌ НЕВЕРНЫЙ');
        
        // Если неверный - покажем первые символы хэша
        if (!isValid) {
            console.log('\n📝 Текущий хэш в БД:', user.password_hash.substring(0, 30) + '...');
            console.log('   Длина хэша:', user.password_hash.length);
        }
        
    } catch (err) {
        console.error('❌ Ошибка:', err);
    } finally {
        await pool.end();
    }
}

testPassword();