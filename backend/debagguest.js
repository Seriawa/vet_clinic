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

async function testGuestPassword() {
    console.log('🔍 ДИАГНОСТИКА ПАРОЛЯ ГОСТЯ');
    console.log('='.repeat(50));
    
    try {
        // Получаем пользователя из БД
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            ['guest@vetclinic.com']
        );
        
        if (result.rows.length === 0) {
            console.log('❌ Пользователь guest@vetclinic.com НЕ НАЙДЕН в базе данных!');
            console.log('\n🔧 Создайте гостя командой:');
            console.log('INSERT INTO users (email, password_hash, name, role, phone, is_active)');
            console.log("VALUES ('guest@vetclinic.com', '$2b$10$nGnW4qY5Qw5Qw5Qw5Qw5Qv5Qw5Qw5Qw5Qw5Qw5Qw5Qw5Qw5Qw', 'Guest User', 'guest', '+7 (999) 765-43-21', true);");
            return;
        }
        
        const user = result.rows[0];
        console.log('✅ Пользователь найден:');
        console.log('   ID:', user.id);
        console.log('   Email:', user.email);
        console.log('   Role:', user.role);
        console.log('   Name:', user.name);
        console.log('   Hash:', user.password_hash ? 'есть ✓' : 'нет ✗');
        console.log('   Phone:', user.phone || 'не указан');
        
        if (!user.password_hash) {
            console.log('\n❌ ХЭШ ПАРОЛЯ ОТСУТСТВУЕТ!');
            console.log('\n🔧 Сгенерируйте новый хэш командой:');
            console.log('node -e "const bcrypt = require(\"bcrypt\"); bcrypt.hash(\"guest123\", 10).then(console.log)"');
            return;
        }
        
        console.log('\n📊 Информация о хэше:');
        console.log('   Длина хэша:', user.password_hash.length, 'символов');
        console.log('   Префикс:', user.password_hash.substring(0, 7));
        console.log('   Начинается с:', user.password_hash.substring(0, 20) + '...');
        
        // Тестируем пароль guest123
        const testPassword = 'guest123';
        console.log(`\n🔐 Тестируем пароль '${testPassword}'...`);
        
        const isValid = await bcrypt.compare(testPassword, user.password_hash);
        
        if (isValid) {
            console.log('   ✅ РЕЗУЛЬТАТ: ПАРОЛЬ ВЕРНЫЙ!');
            console.log('\n🎉 Всё работает правильно! Гость может войти с паролем guest123');
        } else {
            console.log('   ❌ РЕЗУЛЬТАТ: ПАРОЛЬ НЕВЕРНЫЙ!');
            
            // Генерируем правильный хэш для guest123
            console.log('\n🔄 Генерируем правильный хэш для guest123...');
            const correctHash = await bcrypt.hash(testPassword, 10);
            
            console.log('\n✅ Правильный хэш для guest123:');
            console.log('='.repeat(50));
            console.log(correctHash);
            console.log('='.repeat(50));
            
            console.log('\n📝 SQL для исправления (скопируйте и выполните в pgAdmin):');
            console.log('='.repeat(50));
            console.log(`UPDATE users SET password_hash = '${correctHash}' WHERE email = 'guest@vetclinic.com';`);
            console.log('='.repeat(50));
            
            // Проверяем, что новый хэш действительно работает
            const testNewHash = await bcrypt.compare('guest123', correctHash);
            console.log('\n🔍 Проверка нового хэша:', testNewHash ? '✅ РАБОТАЕТ' : '❌ НЕ РАБОТАЕТ');
        }
        
        // Дополнительная диагностика
        console.log('\n📋 Дополнительная информация:');
        console.log('   Аккаунт активен:', user.is_active ? 'да' : 'нет');
        console.log('   Создан:', user.created_at ? new Date(user.created_at).toLocaleString() : 'неизвестно');
        console.log('   Последний вход:', user.last_login ? new Date(user.last_login).toLocaleString() : 'никогда');
        
    } catch (err) {
        console.error('❌ ОШИБКА:', err);
    } finally {
        await pool.end();
        console.log('\n' + '='.repeat(50));
    }
}

// Запускаем диагностику
testGuestPassword();