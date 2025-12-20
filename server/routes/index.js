const express = require('express');
const router = express.Router();

// Import route modules
const productRoutes = require('./productRoutes');
const expenseRoutes = require('./expenseRoutes');
const productionRoutes = require('./productionRoutes');
const salesRoutes = require('./salesRoutes');
const reportRoutes = require('./reportRoutes');

// Mount routes
router.use('/products', productRoutes);
router.use('/expenses', expenseRoutes);
router.use('/production', productionRoutes);
router.use('/sales', salesRoutes);
router.use('/reports', reportRoutes);

module.exports = router;
