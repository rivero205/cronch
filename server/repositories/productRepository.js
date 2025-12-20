const pool = require('../db');

class ProductRepository {
    async findAll() {
        const [rows] = await pool.query('SELECT * FROM products ORDER BY name ASC');
        return rows;
    }

    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
        return rows[0];
    }
}

module.exports = new ProductRepository();
