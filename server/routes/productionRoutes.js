const express = require('express');
const router = express.Router();
const productionService = require('../services/productionService');

// GET /api/production
router.get('/', async (req, res) => {
    try {
        const filters = {};
        if (req.query.date) {
            filters.date = req.query.date;
        }
        
        const production = await productionService.getProduction(filters);
        res.json(production);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/production
router.post('/', async (req, res) => {
    try {
        const production = await productionService.createProduction(req.body);
        res.json({ ...production, message: 'Production added' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
