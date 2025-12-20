const pool = require('../db');

class ProductionRepository {
    async findAll(filters = {}) {
        let query = `
            SELECT dp.*, p.name as product_name 
            FROM daily_production dp 
            JOIN products p ON dp.product_id = p.id
        `;
        const params = [];
        
        if (filters.date) {
            query += ' WHERE dp.date = ?';
            params.push(filters.date);
        }
        
        query += ' ORDER BY dp.id DESC';
        const [rows] = await pool.query(query, params);
        return rows;
    }

    async create(productionData) {
        const { product_id, quantity, unit_cost, date } = productionData;
        const [result] = await pool.query(
            'INSERT INTO daily_production (product_id, quantity, unit_cost, date) VALUES (?, ?, ?, COALESCE(?, CURRENT_DATE))',
            [product_id, quantity, unit_cost, date]
        );
        return { id: result.insertId };
    }
}

module.exports = new ProductionRepository();
