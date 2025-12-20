const express = require('express');
const router = express.Router();
const reportService = require('../services/reportService');

// GET /api/reports/weekly
router.get('/weekly', async (req, res) => {
    try {
        const report = await reportService.getWeeklyReport(req.query.date);
        res.json(report);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET /api/reports/monthly
router.get('/monthly', async (req, res) => {
    try {
        const report = await reportService.getMonthlyReport(req.query.month);
        res.json(report);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET /api/reports/product-profitability
router.get('/product-profitability', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const report = await reportService.getProductProfitability(startDate, endDate);
        res.json(report);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET /api/reports/daily-trend
router.get('/daily-trend', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const report = await reportService.getDailyTrend(startDate, endDate);
        res.json(report);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET /api/reports/most-profitable
router.get('/most-profitable', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const report = await reportService.getMostProfitable(startDate, endDate);
        res.json(report);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET /api/reports/daily (legacy - backwards compatibility)
router.get('/daily', async (req, res) => {
    try {
        const report = await reportService.getDailyReport(req.query.date);
        res.json(report);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ========== DETAILED REPORTS FOR DOWNLOAD ==========

// GET /api/reports/download/weekly
router.get('/download/weekly', async (req, res) => {
    try {
        const report = await reportService.getDetailedWeeklyReport(req.query.date);
        res.json(report);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET /api/reports/download/monthly
router.get('/download/monthly', async (req, res) => {
    try {
        const report = await reportService.getDetailedMonthlyReport(req.query.month);
        res.json(report);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET /api/reports/download/product-profitability
router.get('/download/product-profitability', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const report = await reportService.getDetailedProductProfitability(startDate, endDate);
        res.json(report);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET /api/reports/download/daily-trend
router.get('/download/daily-trend', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const report = await reportService.getDetailedDailyTrend(startDate, endDate);
        res.json(report);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET /api/reports/download/most-profitable
router.get('/download/most-profitable', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const report = await reportService.getDetailedMostProfitable(startDate, endDate);
        res.json(report);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
