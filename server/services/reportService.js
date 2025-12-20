const expenseRepository = require('../repositories/expenseRepository');
const salesRepository = require('../repositories/salesRepository');
const reportRepository = require('../repositories/reportRepository');

class ReportService {
    // Helper function to get week boundaries
    getWeekBoundaries(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d.setDate(diff));
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        
        return {
            start: monday.toISOString().split('T')[0],
            end: sunday.toISOString().split('T')[0]
        };
    }

    async getWeeklyReport(date) {
        if (!date) {
            throw new Error('Date is required');
        }

        const { start, end } = this.getWeekBoundaries(date);

        const totalSales = await salesRepository.sumByDateRange(start, end);
        const totalExpenses = await expenseRepository.sumByDateRange(start, end);

        const weeklyProfit = totalSales - totalExpenses;
        const dailyAverageSales = totalSales / 7;
        const dailyAverageProfit = weeklyProfit / 7;

        return {
            period: { start, end },
            totalSales,
            totalExpenses,
            weeklyProfit,
            dailyAverageSales,
            dailyAverageProfit
        };
    }

    async getMonthlyReport(month) {
        if (!month) {
            throw new Error('Month is required (format: YYYY-MM)');
        }

        // Get first and last day of the month
        const [year, monthNum] = month.split('-');
        const firstDay = `${year}-${monthNum.padStart(2, '0')}-01`;
        const lastDay = new Date(parseInt(year), parseInt(monthNum), 0).getDate();
        const endDay = `${year}-${monthNum.padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

        const totalSales = await salesRepository.sumByDateRange(firstDay, endDay);
        const totalExpenses = await expenseRepository.sumByDateRange(firstDay, endDay);

        const monthlyProfit = totalSales - totalExpenses;
        const dailyAverage = monthlyProfit / lastDay;

        return {
            month,
            period: { start: firstDay, end: endDay },
            totalSales,
            totalExpenses,
            monthlyProfit,
            dailyAverage,
            daysInMonth: lastDay
        };
    }

    async getProductProfitability(startDate, endDate) {
        if (!startDate || !endDate) {
            throw new Error('Start and end dates are required');
        }

        const products = await reportRepository.getProductProfitability(startDate, endDate);

        return {
            period: { start: startDate, end: endDate },
            products
        };
    }

    async getDailyTrend(startDate, endDate) {
        if (!startDate || !endDate) {
            throw new Error('Start and end dates are required');
        }

        const dailyData = await reportRepository.getDailyTrend(startDate, endDate);

        return {
            period: { start: startDate, end: endDate },
            dailyData
        };
    }

    async getMostProfitable(startDate, endDate) {
        if (!startDate || !endDate) {
            throw new Error('Start and end dates are required');
        }

        const product = await reportRepository.getMostProfitableProduct(startDate, endDate);

        return {
            period: { start: startDate, end: endDate },
            product,
            message: product ? undefined : 'No hay productos rentables en este período'
        };
    }

    async getDailyReport(date) {
        if (!date) {
            throw new Error('Date is required');
        }

        const totalExpenses = await expenseRepository.sumByDate(date);
        const totalSales = await salesRepository.sumByDate(date);
        const topProducts = await salesRepository.getProductStatsByDate(date);

        const dailyProfit = totalSales - totalExpenses;

        return {
            date,
            totalExpenses,
            totalSales,
            dailyProfit,
            topProducts
        };
    }

    // ========== DETAILED REPORTS FOR DOWNLOAD ==========

    async getDetailedWeeklyReport(date) {
        if (!date) {
            throw new Error('Date is required');
        }

        const { start, end } = this.getWeekBoundaries(date);

        // Get summary data
        const totalSales = await salesRepository.sumByDateRange(start, end);
        const totalExpenses = await expenseRepository.sumByDateRange(start, end);
        const weeklyProfit = totalSales - totalExpenses;

        // Get detailed data
        const detailedData = await reportRepository.getDetailedWeeklyReport(start, end);

        return {
            period: { start, end },
            summary: {
                totalSales,
                totalExpenses,
                weeklyProfit,
                dailyAverageSales: totalSales / 7,
                dailyAverageProfit: weeklyProfit / 7
            },
            details: detailedData
        };
    }

    async getDetailedMonthlyReport(month) {
        if (!month) {
            throw new Error('Month is required (format: YYYY-MM)');
        }

        try {
            const [year, monthNum] = month.split('-');
            const firstDay = `${year}-${monthNum.padStart(2, '0')}-01`;
            const lastDay = new Date(parseInt(year), parseInt(monthNum), 0).getDate();
            const endDay = `${year}-${monthNum.padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

            console.log('getDetailedMonthlyReport - Dates:', { firstDay, endDay, lastDay });

            // Get summary data
            const totalSales = await salesRepository.sumByDateRange(firstDay, endDay);
            const totalExpenses = await expenseRepository.sumByDateRange(firstDay, endDay);
            const monthlyProfit = totalSales - totalExpenses;

            console.log('getDetailedMonthlyReport - Summary:', { totalSales, totalExpenses, monthlyProfit });

            // Get detailed data
            const detailedData = await reportRepository.getDetailedMonthlyReport(firstDay, endDay);

            console.log('getDetailedMonthlyReport - Detailed data received:', detailedData ? 'Yes' : 'No');

            return {
                month,
                period: { start: firstDay, end: endDay },
                summary: {
                    totalSales,
                    totalExpenses,
                    monthlyProfit,
                    dailyAverage: monthlyProfit / lastDay,
                    daysInMonth: lastDay
                },
                details: detailedData
            };
        } catch (error) {
            console.error('Error in getDetailedMonthlyReport:', error);
            throw error;
        }
    }

    async getDetailedProductProfitability(startDate, endDate) {
        if (!startDate || !endDate) {
            throw new Error('Start and end dates are required');
        }

        // Get summary
        const products = await reportRepository.getProductProfitability(startDate, endDate);

        // Get detailed data
        const detailedData = await reportRepository.getDetailedProductProfitability(startDate, endDate);

        return {
            period: { start: startDate, end: endDate },
            summary: { products },
            details: detailedData
        };
    }

    async getDetailedDailyTrend(startDate, endDate) {
        if (!startDate || !endDate) {
            throw new Error('Start and end dates are required');
        }

        const dailyData = await reportRepository.getDailyTrend(startDate, endDate);
        const detailedData = await reportRepository.getDetailedWeeklyReport(startDate, endDate);

        return {
            period: { start: startDate, end: endDate },
            summary: { dailyData },
            details: detailedData
        };
    }

    async getDetailedMostProfitable(startDate, endDate) {
        if (!startDate || !endDate) {
            throw new Error('Start and end dates are required');
        }

        const product = await reportRepository.getMostProfitableProduct(startDate, endDate);
        const allProducts = await reportRepository.getProductProfitability(startDate, endDate);

        return {
            period: { start: startDate, end: endDate },
            mostProfitable: product,
            allProducts: allProducts,
            message: product ? undefined : 'No hay productos rentables en este período'
        };
    }
}

module.exports = new ReportService();
