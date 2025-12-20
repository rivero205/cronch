const express = require('express');
const router = express.Router();
const salesService = require('../services/salesService');

// GET /api/sales
router.get('/', async (req, res) => {
    try {
        const filters = {};
        if (req.query.date) {
            filters.date = req.query.date;
        }
        
        const sales = await salesService.getSales(filters);
        res.json(sales);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/sales
router.post('/', async (req, res) => {
    try {
        const sale = await salesService.createSale(req.body);
        res.json({ ...sale, message: 'Sale added' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
