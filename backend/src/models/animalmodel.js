// backend/models/animalModel.js
const db = require('../config/database');

class AnimalModel {
    // Получение всех животных
    async findAll() {
        console.log('🔍 animalModel.findAll');
        try {
            const result = await db.query(`
                SELECT a.*, u.name as created_by_name 
                FROM animals a 
                LEFT JOIN users u ON a.created_by = u.id
                ORDER BY a.created_at DESC
            `);
            console.log(`✅ Найдено животных: ${result.rows.length}`);
            return result.rows;
        } catch (error) {
            console.error('❌ Error in animalModel.findAll:', error);
            throw error;
        }
    }

    // Получение животного по ID
    async findById(id) {
        console.log(`🔍 animalModel.findById: ${id}`);
        try {
            const result = await db.query(`
                SELECT a.*, u.name as created_by_name 
                FROM animals a 
                LEFT JOIN users u ON a.created_by = u.id
                WHERE a.id = $1
            `, [id]);
            return result.rows[0];
        } catch (error) {
            console.error('❌ Error in animalModel.findById:', error);
            throw error;
        }
    }

    // Создание нового животного
    async create(animalData, userId) {
        console.log('📝 animalModel.create:', { animalData, userId });
        
        const {
            name,
            species,
            breed,
            gender,
            birth_date,
            color,
            microchip_number,
            passport_number,
            owner_name,
            owner_phone,
            owner_email,
            owner_address,
            status = 'active',
            allergies,
            chronic_diseases,
            special_notes
        } = animalData;

        // Проверка обязательных полей
        if (!name || !species || !owner_name || !owner_phone) {
            throw new Error('Обязательные поля: name, species, owner_name, owner_phone');
        }

        const query = `
            INSERT INTO animals (
                name, species, breed, gender, birth_date,
                color, microchip_number, passport_number,
                owner_name, owner_phone, owner_email, owner_address,
                status, allergies, chronic_diseases, special_notes,
                created_by, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING *
        `;

        const values = [
            name, species, breed || null, gender || null, birth_date || null,
            color || null, microchip_number || null, passport_number || null,
            owner_name, owner_phone, owner_email || null, owner_address || null,
            status, allergies || null, chronic_diseases || null, special_notes || null,
            userId
        ];

        try {
            const result = await db.query(query, values);
            console.log('✅ Animal created:', result.rows[0]);
            return result.rows[0];
        } catch (error) {
            console.error('❌ Error in animalModel.create:', error);
            throw error;
        }
    }

    // Обновление животного
    async update(id, animalData, userId) {
        console.log(`📝 animalModel.update: ${id}`, animalData);
        
        const {
            name, species, breed, gender, birth_date,
            color, microchip_number, passport_number,
            owner_name, owner_phone, owner_email, owner_address,
            status, allergies, chronic_diseases, special_notes
        } = animalData;

        const query = `
            UPDATE animals 
            SET 
                name = COALESCE($1, name),
                species = COALESCE($2, species),
                breed = COALESCE($3, breed),
                gender = COALESCE($4, gender),
                birth_date = COALESCE($5, birth_date),
                color = COALESCE($6, color),
                microchip_number = COALESCE($7, microchip_number),
                passport_number = COALESCE($8, passport_number),
                owner_name = COALESCE($9, owner_name),
                owner_phone = COALESCE($10, owner_phone),
                owner_email = COALESCE($11, owner_email),
                owner_address = COALESCE($12, owner_address),
                status = COALESCE($13, status),
                allergies = COALESCE($14, allergies),
                chronic_diseases = COALESCE($15, chronic_diseases),
                special_notes = COALESCE($16, special_notes),
                updated_by = $17,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $18
            RETURNING *
        `;

        const values = [
            name, species, breed, gender, birth_date,
            color, microchip_number, passport_number,
            owner_name, owner_phone, owner_email, owner_address,
            status, allergies, chronic_diseases, special_notes,
            userId, id
        ];

        try {
            const result = await db.query(query, values);
            console.log('✅ Animal updated:', result.rows[0]);
            return result.rows[0];
        } catch (error) {
            console.error('❌ Error in animalModel.update:', error);
            throw error;
        }
    }

    // Удаление животного
    async delete(id) {
        console.log(`🗑️ animalModel.delete: ${id}`);
        
        const query = 'DELETE FROM animals WHERE id = $1 RETURNING id';
        const values = [id];

        try {
            const result = await db.query(query, values);
            console.log('✅ Animal deleted:', result.rows[0]);
            return result.rows[0];
        } catch (error) {
            console.error('❌ Error in animalModel.delete:', error);
            throw error;
        }
    }

    // Поиск по владельцу
    async findByOwner(ownerPhone) {
        console.log(`🔍 animalModel.findByOwner: ${ownerPhone}`);
        
        const query = `
            SELECT * FROM animals 
            WHERE owner_phone LIKE $1
            ORDER BY created_at DESC
        `;
        const values = [`%${ownerPhone}%`];

        try {
            const result = await db.query(query, values);
            return result.rows;
        } catch (error) {
            console.error('❌ Error in animalModel.findByOwner:', error);
            throw error;
        }
    }
}

module.exports = new AnimalModel();