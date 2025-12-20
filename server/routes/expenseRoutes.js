const express = require('express');
const router = express.Router();
const expenseService = require('../services/expenseService');

// GET /api/expenses
router.get('/', async (req, res) => {
    try {
        const filters = {};
        if (req.query.date) {
            filters.date = req.query.date;
        }
        
        const expenses = await expenseService.getExpenses(filters);
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/expenses
router.post('/', async (req, res) => {
    try {
        const expense = await expenseService.createExpense(req.body);
        res.json(expense);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
