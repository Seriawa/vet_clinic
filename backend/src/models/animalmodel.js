// backend/src/models/animalModel.js
const db = require('../config/database');

class AnimalModel {
    // Получение всех животных
    async findAll() {
        const query = `
            SELECT * FROM animals 
            ORDER BY created_at DESC
        `;
        
        try {
            const result = await db.query(query);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    // Получение животного по ID
    async findById(id) {
        const query = `
            SELECT a.*, 
                   COUNT(v.id) as total_visits,
                   json_agg(
                       json_build_object(
                           'id', v.id,
                           'visit_date', v.visit_date,
                           'reason', v.reason,
                           'diagnosis', v.diagnosis
                       ) ORDER BY v.visit_date DESC
                   ) FILTER (WHERE v.id IS NOT NULL) as visits
            FROM animals a
            LEFT JOIN visits v ON a.id = v.animal_id
            WHERE a.id = $1
            GROUP BY a.id
        `;
        const values = [id];
        
        try {
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Создание нового животного
    async create(animalData, userId) {
        const {
            name, species, breed, gender, birth_date,
            color, microchip_number, passport_number,
            owner_name, owner_phone, owner_email, owner_address,
            status, allergies, chronic_diseases, special_notes
        } = animalData;

        const query = `
            INSERT INTO animals (
                name, species, breed, gender, birth_date,
                color, microchip_number, passport_number,
                owner_name, owner_phone, owner_email, owner_address,
                status, allergies, chronic_diseases, special_notes,
                created_by
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            RETURNING *
        `;
        
        const values = [
            name, species, breed, gender, birth_date,
            color, microchip_number, passport_number,
            owner_name, owner_phone, owner_email, owner_address,
            status, allergies, chronic_diseases, special_notes,
            userId
        ];
        
        try {
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Обновление животного
    async update(id, animalData, userId) {
        const {
            name, species, breed, gender, birth_date,
            color, microchip_number, passport_number,
            owner_name, owner_phone, owner_email, owner_address,
            status, allergies, chronic_diseases, special_notes
        } = animalData;

        const query = `
            UPDATE animals 
            SET 
                name = $1, species = $2, breed = $3, gender = $4, birth_date = $5,
                color = $6, microchip_number = $7, passport_number = $8,
                owner_name = $9, owner_phone = $10, owner_email = $11, owner_address = $12,
                status = $13, allergies = $14, chronic_diseases = $15, special_notes = $16,
                updated_by = $17, updated_at = CURRENT_TIMESTAMP
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
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Удаление животного
    async delete(id) {
        const query = 'DELETE FROM animals WHERE id = $1 RETURNING id';
        const values = [id];
        
        try {
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Поиск животных по владельцу
    async findByOwner(ownerPhone) {
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
            throw error;
        }
    }
}

module.exports = new AnimalModel();