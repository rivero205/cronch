const API_URL = 'http://localhost:5000/api';

export const api = {
    // Products
    getProducts: async () => {
        const res = await fetch(`${API_URL}/products`);
        return res.json();
    },

    // Expenses
    getExpenses: async (date) => {
        const query = date ? `?date=${date}` : '';
        const res = await fetch(`${API_URL}/expenses${query}`);
        return res.json();
    },
    addExpense: async (data) => {
        const res = await fetch(`${API_URL}/expenses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.json();
    },

    // Production
    getProduction: async (date) => {
        const query = date ? `?date=${date}` : '';
        const res = await fetch(`${API_URL}/production${query}`);
        return res.json();
    },
    addProduction: async (data) => {
        const res = await fetch(`${API_URL}/production`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.json();
    },

    // Sales
    getSales: async (date) => {
        const query = date ? `?date=${date}` : '';
        const res = await fetch(`${API_URL}/sales${query}`);
        return res.json();
    },
    addSale: async (data) => {
        const res = await fetch(`${API_URL}/sales`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.json();
    },

    // Reports
    getDailyReport: async (date) => {
        const res = await fetch(`${API_URL}/reports/daily?date=${date}`);
        return res.json();
    },
    
    // New Reports MVP
    getWeeklyReport: async (date) => {
        const res = await fetch(`${API_URL}/reports/weekly?date=${date}`);
        return res.json();
    },
    
    getMonthlyReport: async (month) => {
        const res = await fetch(`${API_URL}/reports/monthly?month=${month}`);
        return res.json();
    },
    
    getProductProfitability: async (startDate, endDate) => {
        const res = await fetch(`${API_URL}/reports/product-profitability?startDate=${startDate}&endDate=${endDate}`);
        return res.json();
    },
    
    getDailyTrend: async (startDate, endDate) => {
        const res = await fetch(`${API_URL}/reports/daily-trend?startDate=${startDate}&endDate=${endDate}`);
        return res.json();
    },
    
    getMostProfitable: async (startDate, endDate) => {
        const res = await fetch(`${API_URL}/reports/most-profitable?startDate=${startDate}&endDate=${endDate}`);
        return res.json();
    },

    // Detailed Reports for Download
    getDetailedWeeklyReport: async (date) => {
        const res = await fetch(`${API_URL}/reports/download/weekly?date=${date}`);
        return res.json();
    },

    getDetailedMonthlyReport: async (month) => {
        const res = await fetch(`${API_URL}/reports/download/monthly?month=${month}`);
        return res.json();
    },

    getDetailedProductProfitability: async (startDate, endDate) => {
        const res = await fetch(`${API_URL}/reports/download/product-profitability?startDate=${startDate}&endDate=${endDate}`);
        return res.json();
    },

    getDetailedDailyTrend: async (startDate, endDate) => {
        const res = await fetch(`${API_URL}/reports/download/daily-trend?startDate=${startDate}&endDate=${endDate}`);
        return res.json();
    },

    getDetailedMostProfitable: async (startDate, endDate) => {
        const res = await fetch(`${API_URL}/reports/download/most-profitable?startDate=${startDate}&endDate=${endDate}`);
        return res.json();
    },
};
