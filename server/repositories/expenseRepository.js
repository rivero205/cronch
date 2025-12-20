const pool = require('../db');

class ExpenseRepository {
    async findAll(filters = {}) {
        let query = 'SELECT * FROM expenses';
        const params = [];
        
        if (filters.date) {
            query += ' WHERE date = ?';
            params.push(filters.date);
        }
        
        query += ' ORDER BY id DESC';
        const [rows] = await pool.query(query, params);
        return rows;
    }

    async create(expenseData) {
        const { description, amount, date } = expenseData;
        const [result] = await pool.query(
            'INSERT INTO expenses (description, amount, date) VALUES (?, ?, COALESCE(?, CURRENT_DATE))',
            [description, amount, date]
        );
        return { id: result.insertId, description, amount, date };
    }

    async sumByDateRange(startDate, endDate) {
        const [rows] = await pool.query(
            'SELECT SUM(amount) as total_expenses FROM expenses WHERE date BETWEEN ? AND ?',
            [startDate, endDate]
        );
        return Number(rows[0].total_expenses || 0);
    }

    async sumByDate(date) {
        const [rows] = await pool.query(
            'SELECT SUM(amount) as total_expenses FROM expenses WHERE date = ?',
            [date]
        );
        return Number(rows[0].total_expenses || 0);
    }
}

module.exports = new ExpenseRepository();
