// backend/src/models/userModel.js
const db = require('../config/database');

class UserModel {
    // Создание нового пользователя
    async create(userData) {
        const { email, password_hash, name, phone, role = 'guest' } = userData;
        
        const query = `
            INSERT INTO users (email, password_hash, name, phone, role)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, email, name, phone, role, created_at
        `;
        
        const values = [email, password_hash, name, phone, role];
        
        try {
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Поиск пользователя по email
    async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = $1';
        const values = [email];
        
        try {
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Поиск пользователя по ID
    async findById(id) {
        const query = `
            SELECT id, email, name, phone, role, is_active, created_at 
            FROM users WHERE id = $1
        `;
        const values = [id];
        
        try {
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Обновление последнего входа
    async updateLastLogin(id) {
        const query = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1';
        const values = [id];
        
        try {
            await db.query(query, values);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new UserModel();