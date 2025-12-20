const pool = require('../db');

class SalesRepository {
    async findAll(filters = {}) {
        let query = `
            SELECT ds.*, p.name as product_name 
            FROM daily_sales ds 
            JOIN products p ON ds.product_id = p.id
        `;
        const params = [];
        
        if (filters.date) {
            query += ' WHERE ds.date = ?';
            params.push(filters.date);
        }
        
        query += ' ORDER BY ds.id DESC';
        const [rows] = await pool.query(query, params);
        return rows;
    }

    async create(saleData) {
        const { product_id, quantity, unit_price, date } = saleData;
        const [result] = await pool.query(
            'INSERT INTO daily_sales (product_id, quantity, unit_price, date) VALUES (?, ?, ?, COALESCE(?, CURRENT_DATE))',
            [product_id, quantity, unit_price, date]
        );
        return { id: result.insertId };
    }

    async sumByDateRange(startDate, endDate) {
        const [rows] = await pool.query(
            'SELECT SUM(quantity * unit_price) as total_sales FROM daily_sales WHERE date BETWEEN ? AND ?',
            [startDate, endDate]
        );
        return Number(rows[0].total_sales || 0);
    }

    async sumByDate(date) {
        const [rows] = await pool.query(
            'SELECT SUM(quantity * unit_price) as total_sales FROM daily_sales WHERE date = ?',
            [date]
        );
        return Number(rows[0].total_sales || 0);
    }

    async getProductStatsByDate(date) {
        const [rows] = await pool.query(`
            SELECT 
                p.name, 
                SUM(ds.quantity * ds.unit_price) as sales_amount,
                SUM(ds.quantity) as quantity_sold
            FROM daily_sales ds
            JOIN products p ON ds.product_id = p.id
            WHERE ds.date = ?
            GROUP BY p.id
            ORDER BY sales_amount DESC
        `, [date]);
        return rows;
    }
}

module.exports = new SalesRepository();
