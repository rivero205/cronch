const express = require('express');
const router = express.Router();
const reportService = require('../services/reportService');

const checkRole = require('../middleware/roleMiddleware');
const authMiddleware = require('../middleware/authMiddleware'); // Ensure authMiddleware is available if not globally applied? 
// In index.js authMiddleware is applied globally to reports, but checkRole needs req.user. 
// checking index.js: router.use('/reports', reportRoutes) is AFTER router.use(authMiddleware). Good.

// Apply Role Check to ALL report routes (Super Admin & Admin only)
router.use(checkRole(['super_admin', 'admin']));

// GET /api/reports/weekly
router.get('/weekly', async (req, res) => {
    try {
        const report = await reportService.getWeeklyReport(req.user.id, req.user.business_id, req.query.date);
        res.json(report);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET /api/reports/monthly
router.get('/monthly', async (req, res) => {
    try {
        const report = await reportService.getMonthlyReport(req.user.id, req.user.business_id, req.query.month);
        res.json(report);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET /api/reports/product-profitability
router.get('/product-profitability', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const report = await reportService.getProductProfitability(req.user.id, req.user.business_id, startDate, endDate);
        res.json(report);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET /api/reports/daily-trend
router.get('/daily-trend', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const report = await reportService.getDailyTrend(req.user.id, req.user.business_id, startDate, endDate);
        res.json(report);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET /api/reports/most-profitable
router.get('/most-profitable', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const report = await reportService.getMostProfitable(req.user.id, req.user.business_id, startDate, endDate);
        res.json(report);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET /api/reports/daily - supports single date or date range
router.get('/daily', async (req, res) => {
    try {
        const { date, startDate, endDate } = req.query;
        const report = await reportService.getDailyReport(req.user.id, req.user.business_id, date, startDate, endDate);
        res.json(report);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ========== DETAILED REPORTS FOR DOWNLOAD ==========

// GET /api/reports/download/weekly
router.get('/download/weekly', async (req, res) => {
    try {
        const workbook = await reportService.generateWeeklyExcel(req.user.id, req.user.business_id, req.query.date);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="reporte-semanal-${req.query.date}.xlsx"`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
});

// GET /api/reports/download/monthly
router.get('/download/monthly', async (req, res) => {
    try {
        const workbook = await reportService.generateMonthlyExcel(req.user.id, req.user.business_id, req.query.month);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="reporte-mensual-${req.query.month}.xlsx"`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
});

// GET /api/reports/download/product-profitability
router.get('/download/product-profitability', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const workbook = await reportService.generateProductProfitabilityExcel(req.user.id, req.user.business_id, startDate, endDate);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="rentabilidad-${startDate}-al-${endDate}.xlsx"`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
});

// GET /api/reports/download/daily-trend
router.get('/download/daily-trend', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const workbook = await reportService.generateDailyTrendExcel(req.user.id, req.user.business_id, startDate, endDate);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="tendencia-${startDate}-al-${endDate}.xlsx"`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
});

// GET /api/reports/download/most-profitable
router.get('/download/most-profitable', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const workbook = await reportService.generateMostProfitableExcel(req.user.id, req.user.business_id, startDate, endDate);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="mas-rentable-${startDate}-al-${endDate}.xlsx"`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
