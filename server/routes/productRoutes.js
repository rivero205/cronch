const express = require('express');
const router = express.Router();
const productService = require('../services/productService');

// GET /api/products
router.get('/', async (req, res) => {
    try {
        const products = await productService.getAllProducts();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
