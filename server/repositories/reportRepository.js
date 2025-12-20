const pool = require('../db');

class ReportRepository {
    async getProductProfitability(startDate, endDate) {
        const [rows] = await pool.query(`
            SELECT 
                p.id,
                p.name,
                COALESCE(SUM(ds.quantity), 0) as quantity_sold,
                COALESCE(SUM(ds.quantity * ds.unit_price), 0) as total_sales,
                COALESCE(SUM(dp.quantity * dp.unit_cost), 0) as production_cost,
                COALESCE(SUM(ds.quantity * ds.unit_price) - SUM(dp.quantity * dp.unit_cost), 0) as profit
            FROM products p
            LEFT JOIN daily_sales ds ON p.id = ds.product_id AND ds.date BETWEEN ? AND ?
            LEFT JOIN daily_production dp ON p.id = dp.product_id AND dp.date BETWEEN ? AND ?
            GROUP BY p.id, p.name
            ORDER BY profit DESC
        `, [startDate, endDate, startDate, endDate]);
        
        return rows.map(row => ({
            id: row.id,
            name: row.name,
            quantitySold: Number(row.quantity_sold),
            totalSales: Number(row.total_sales),
            productionCost: Number(row.production_cost),
            profit: Number(row.profit)
        }));
    }

    async getDailyTrend(startDate, endDate) {
        const [rows] = await pool.query(`
            SELECT 
                dates.date,
                COALESCE(SUM(ds.quantity * ds.unit_price), 0) as sales,
                COALESCE(expenses.total, 0) as expenses,
                COALESCE(SUM(ds.quantity * ds.unit_price), 0) - COALESCE(expenses.total, 0) as profit
            FROM (
                SELECT DISTINCT date FROM daily_sales WHERE date BETWEEN ? AND ?
                UNION
                SELECT DISTINCT date FROM expenses WHERE date BETWEEN ? AND ?
            ) as dates
            LEFT JOIN daily_sales ds ON dates.date = ds.date
            LEFT JOIN (
                SELECT date, SUM(amount) as total 
                FROM expenses 
                WHERE date BETWEEN ? AND ?
                GROUP BY date
            ) as expenses ON dates.date = expenses.date
            GROUP BY dates.date
            ORDER BY dates.date ASC
        `, [startDate, endDate, startDate, endDate, startDate, endDate]);

        return rows.map(row => ({
            date: row.date,
            sales: Number(row.sales),
            expenses: Number(row.expenses),
            profit: Number(row.profit)
        }));
    }

    async getMostProfitableProduct(startDate, endDate) {
        const [rows] = await pool.query(`
            SELECT 
                p.id,
                p.name,
                COALESCE(SUM(ds.quantity), 0) as quantity_sold,
                COALESCE(SUM(ds.quantity * ds.unit_price), 0) as total_sales,
                COALESCE(SUM(dp.quantity * dp.unit_cost), 0) as production_cost,
                COALESCE(SUM(ds.quantity * ds.unit_price) - SUM(dp.quantity * dp.unit_cost), 0) as profit
            FROM products p
            LEFT JOIN daily_sales ds ON p.id = ds.product_id AND ds.date BETWEEN ? AND ?
            LEFT JOIN daily_production dp ON p.id = dp.product_id AND dp.date BETWEEN ? AND ?
            GROUP BY p.id, p.name
            HAVING profit > 0
            ORDER BY profit DESC
            LIMIT 1
        `, [startDate, endDate, startDate, endDate]);

        if (rows.length === 0) {
            return null;
        }

        return {
            id: rows[0].id,
            name: rows[0].name,
            quantitySold: Number(rows[0].quantity_sold),
            totalSales: Number(rows[0].total_sales),
            productionCost: Number(rows[0].production_cost),
            profit: Number(rows[0].profit)
        };
    }

    // ========== DETAILED REPORTS FOR DOWNLOAD ==========

    async getDetailedWeeklyReport(startDate, endDate) {
        // Datos diarios de ventas
        const [dailySales] = await pool.query(`
            SELECT 
                ds.date,
                p.name as product_name,
                ds.quantity,
                ds.unit_price,
                (ds.quantity * ds.unit_price) as total
            FROM daily_sales ds
            JOIN products p ON ds.product_id = p.id
            WHERE ds.date BETWEEN ? AND ?
            ORDER BY ds.date ASC, p.name ASC
        `, [startDate, endDate]);

        // Datos diarios de gastos
        const [dailyExpenses] = await pool.query(`
            SELECT date, description, amount
            FROM expenses
            WHERE date BETWEEN ? AND ?
            ORDER BY date ASC
        `, [startDate, endDate]);

        // Resumen por día
        const [dailySummary] = await pool.query(`
            SELECT 
                dates.date,
                COALESCE(SUM(ds.quantity * ds.unit_price), 0) as sales,
                COALESCE(expenses.total, 0) as expenses,
                COALESCE(SUM(ds.quantity * ds.unit_price), 0) - COALESCE(expenses.total, 0) as profit
            FROM (
                SELECT DISTINCT date FROM daily_sales WHERE date BETWEEN ? AND ?
                UNION
                SELECT DISTINCT date FROM expenses WHERE date BETWEEN ? AND ?
                UNION
                SELECT DATE_ADD(?, INTERVAL n DAY) as date
                FROM (SELECT 0 n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6) nums
                WHERE DATE_ADD(?, INTERVAL n DAY) <= ?
            ) as dates
            LEFT JOIN daily_sales ds ON dates.date = ds.date
            LEFT JOIN (
                SELECT date, SUM(amount) as total 
                FROM expenses 
                WHERE date BETWEEN ? AND ?
                GROUP BY date
            ) as expenses ON dates.date = expenses.date
            GROUP BY dates.date
            ORDER BY dates.date ASC
        `, [startDate, endDate, startDate, endDate, startDate, startDate, endDate, startDate, endDate]);

        return {
            dailySales: dailySales.map(row => ({
                date: row.date,
                productName: row.product_name,
                quantity: Number(row.quantity),
                unitPrice: Number(row.unit_price),
                total: Number(row.total)
            })),
            dailyExpenses: dailyExpenses.map(row => ({
                date: row.date,
                description: row.description,
                amount: Number(row.amount)
            })),
            dailySummary: dailySummary.map(row => ({
                date: row.date,
                sales: Number(row.sales),
                expenses: Number(row.expenses),
                profit: Number(row.profit)
            }))
        };
    }

    async getDetailedMonthlyReport(startDate, endDate) {
        // Datos diarios de ventas
        const [dailySales] = await pool.query(`
            SELECT 
                ds.date,
                p.name as product_name,
                ds.quantity,
                ds.unit_price,
                (ds.quantity * ds.unit_price) as total
            FROM daily_sales ds
            JOIN products p ON ds.product_id = p.id
            WHERE ds.date BETWEEN ? AND ?
            ORDER BY ds.date ASC, p.name ASC
        `, [startDate, endDate]);

        // Datos diarios de gastos
        const [dailyExpenses] = await pool.query(`
            SELECT date, description, amount
            FROM expenses
            WHERE date BETWEEN ? AND ?
            ORDER BY date ASC
        `, [startDate, endDate]);

        // Datos diarios de producción
        const [dailyProduction] = await pool.query(`
            SELECT 
                dp.date,
                p.name as product_name,
                dp.quantity,
                dp.unit_cost,
                (dp.quantity * dp.unit_cost) as total_cost
            FROM daily_production dp
            JOIN products p ON dp.product_id = p.id
            WHERE dp.date BETWEEN ? AND ?
            ORDER BY dp.date ASC, p.name ASC
        `, [startDate, endDate]);

        // Resumen por día
        const [dailySummary] = await pool.query(`
            SELECT 
                dates.date,
                COALESCE(SUM(ds.quantity * ds.unit_price), 0) as sales,
                COALESCE(MAX(expenses.total), 0) as expenses,
                COALESCE(SUM(ds.quantity * ds.unit_price), 0) - COALESCE(MAX(expenses.total), 0) as profit
            FROM (
                SELECT DISTINCT date FROM daily_sales WHERE date BETWEEN ? AND ?
                UNION
                SELECT DISTINCT date FROM expenses WHERE date BETWEEN ? AND ?
            ) as dates
            LEFT JOIN daily_sales ds ON dates.date = ds.date
            LEFT JOIN (
                SELECT date, SUM(amount) as total 
                FROM expenses 
                WHERE date BETWEEN ? AND ?
                GROUP BY date
            ) as expenses ON dates.date = expenses.date
            GROUP BY dates.date
            ORDER BY dates.date ASC
        `, [startDate, endDate, startDate, endDate, startDate, endDate]);

        // Resumen de productos más vendidos
        const [topProducts] = await pool.query(`
            SELECT 
                p.name,
                SUM(ds.quantity) as total_quantity,
                SUM(ds.quantity * ds.unit_price) as total_revenue
            FROM daily_sales ds
            JOIN products p ON ds.product_id = p.id
            WHERE ds.date BETWEEN ? AND ?
            GROUP BY p.id, p.name
            ORDER BY total_revenue DESC
            LIMIT 5
        `, [startDate, endDate]);

        return {
            dailySales: dailySales.map(row => ({
                date: row.date,
                productName: row.product_name,
                quantity: Number(row.quantity),
                unitPrice: Number(row.unit_price),
                total: Number(row.total)
            })),
            dailyExpenses: dailyExpenses.map(row => ({
                date: row.date,
                description: row.description,
                amount: Number(row.amount)
            })),
            dailyProduction: dailyProduction.map(row => ({
                date: row.date,
                productName: row.product_name,
                quantity: Number(row.quantity),
                unitCost: Number(row.unit_cost),
                totalCost: Number(row.total_cost)
            })),
            dailySummary: dailySummary.map(row => ({
                date: row.date,
                sales: Number(row.sales),
                expenses: Number(row.expenses),
                profit: Number(row.profit)
            })),
            topProducts: topProducts.map(row => ({
                name: row.name,
                totalQuantity: Number(row.total_quantity),
                totalRevenue: Number(row.total_revenue)
            }))
        };
    }

    async getDetailedProductProfitability(startDate, endDate) {
        // Ventas por producto por día
        const [salesByDay] = await pool.query(`
            SELECT 
                ds.date,
                p.name as product_name,
                ds.quantity,
                ds.unit_price,
                (ds.quantity * ds.unit_price) as revenue
            FROM daily_sales ds
            JOIN products p ON ds.product_id = p.id
            WHERE ds.date BETWEEN ? AND ?
            ORDER BY p.name ASC, ds.date ASC
        `, [startDate, endDate]);

        // Producción por producto por día
        const [productionByDay] = await pool.query(`
            SELECT 
                dp.date,
                p.name as product_name,
                dp.quantity,
                dp.unit_cost,
                (dp.quantity * dp.unit_cost) as cost
            FROM daily_production dp
            JOIN products p ON dp.product_id = p.id
            WHERE dp.date BETWEEN ? AND ?
            ORDER BY p.name ASC, dp.date ASC
        `, [startDate, endDate]);

        return {
            salesByDay: salesByDay.map(row => ({
                date: row.date,
                productName: row.product_name,
                quantity: Number(row.quantity),
                unitPrice: Number(row.unit_price),
                revenue: Number(row.revenue)
            })),
            productionByDay: productionByDay.map(row => ({
                date: row.date,
                productName: row.product_name,
                quantity: Number(row.quantity),
                unitCost: Number(row.unit_cost),
                cost: Number(row.cost)
            }))
        };
    }
}

module.exports = new ReportRepository();
