// backend/models/userModel.js
const db = require('../config/database');

class UserModel {
    // Создание нового пользователя
    async create(userData) {
        const { name, email, phone, password_hash, role = 'guest' } = userData;
        
        console.log('📝 userModel.create:', { name, email, phone, role });
        
        const query = `
            INSERT INTO users (
                name, 
                email, 
                phone, 
                password_hash, 
                role, 
                is_active,
                created_at
            )
            VALUES ($1, $2, $3, $4, $5, true, CURRENT_TIMESTAMP)
            RETURNING id, name, email, phone, role, created_at
        `;
        
        const values = [name, email, phone || null, password_hash, role];
        
        try {
            const result = await db.query(query, values);
            console.log('✅ User created in DB:', result.rows[0]);
            return result.rows[0];
        } catch (error) {
            console.error('❌ Error in userModel.create:', error);
            throw error;
        }
    }

    // Поиск пользователя по email
    async findByEmail(email) {
        console.log('🔍 userModel.findByEmail:', email);
        
        const query = 'SELECT * FROM users WHERE email = $1';
        const values = [email];
        
        try {
            const result = await db.query(query, values);
            console.log('✅ User found:', result.rows[0] ? 'yes' : 'no');
            return result.rows[0];
        } catch (error) {
            console.error('❌ Error in userModel.findByEmail:', error);
            throw error;
        }
    }

    // Поиск пользователя по ID
    async findById(id) {
        console.log('🔍 userModel.findById:', id);
        
        const query = `
            SELECT id, name, email, phone, role, created_at, last_login 
            FROM users WHERE id = $1
        `;
        const values = [id];
        
        try {
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('❌ Error in userModel.findById:', error);
            throw error;
        }
    }

    // Обновление времени последнего входа
    async updateLastLogin(id) {
        console.log('🔄 userModel.updateLastLogin:', id);
        
        const query = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1';
        const values = [id];
        
        try {
            await db.query(query, values);
            console.log('✅ Last login updated');
        } catch (error) {
            console.error('❌ Error in userModel.updateLastLogin:', error);
            throw error;
        }
    }
}

module.exports = new UserModel();