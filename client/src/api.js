import { supabase } from './lib/supabaseClient';

const API_URL = 'http://localhost:5000/api';

// Helper function to get auth headers
async function getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        throw new Error('No active session');
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
    };
}

// Products
export const getProducts = async () => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/products`, { headers });
    return res.json();
};

export const createProduct = async (productData) => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers,
        body: JSON.stringify(productData),
    });
    return res.json();
};

export const updateProduct = async (id, productData) => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(productData),
    });
    return res.json();
};

export const deleteProduct = async (id) => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers,
    });
    return res.json();
};

// Expenses
export const getExpenses = async (filters = {}) => {
    const headers = await getAuthHeaders();
    const queryParams = new URLSearchParams(filters).toString();
    const res = await fetch(`${API_URL}/expenses?${queryParams}`, { headers });
    return res.json();
};

export const createExpense = async (expenseData) => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/expenses`, {
        method: 'POST',
        headers,
        body: JSON.stringify(expenseData),
    });
    return res.json();
};

export const updateExpense = async (id, expenseData) => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/expenses/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(expenseData),
    });
    return res.json();
};

export const deleteExpense = async (id) => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/expenses/${id}`, {
        method: 'DELETE',
        headers,
    });
    return res.json();
};

// Production
export const getProduction = async (filters = {}) => {
    const headers = await getAuthHeaders();
    const queryParams = new URLSearchParams(filters).toString();
    const res = await fetch(`${API_URL}/production?${queryParams}`, { headers });
    return res.json();
};

export const createProduction = async (productionData) => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/production`, {
        method: 'POST',
        headers,
        body: JSON.stringify(productionData),
    });
    return res.json();
};

export const updateProduction = async (id, productionData) => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/production/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(productionData),
    });
    return res.json();
};

export const deleteProduction = async (id) => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/production/${id}`, {
        method: 'DELETE',
        headers,
    });
    return res.json();
};

// Sales
export const getSales = async (filters = {}) => {
    const headers = await getAuthHeaders();
    const queryParams = new URLSearchParams(filters).toString();
    const res = await fetch(`${API_URL}/sales?${queryParams}`, { headers });
    return res.json();
};

export const createSale = async (saleData) => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/sales`, {
        method: 'POST',
        headers,
        body: JSON.stringify(saleData),
    });
    return res.json();
};

export const updateSale = async (id, saleData) => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/sales/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(saleData),
    });
    return res.json();
};

export const deleteSale = async (id) => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/sales/${id}`, {
        method: 'DELETE',
        headers,
    });
    return res.json();
};

// Reports
export const getWeeklyReport = async (date) => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/reports/weekly?date=${date}`, { headers });
    return res.json();
};

export const getMonthlyReport = async (month) => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/reports/monthly?month=${month}`, { headers });
    return res.json();
};

export const getProductProfitability = async (startDate, endDate) => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/reports/product-profitability?startDate=${startDate}&endDate=${endDate}`, { headers });
    return res.json();
};

export const getDailyTrend = async (startDate, endDate) => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/reports/daily-trend?startDate=${startDate}&endDate=${endDate}`, { headers });
    return res.json();
};

export const getMostProfitable = async (startDate, endDate) => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/reports/most-profitable?startDate=${startDate}&endDate=${endDate}`, { headers });
    return res.json();
};

export const getDailyReport = async (date, startDate = null, endDate = null) => {
    const headers = await getAuthHeaders();
    let url = `${API_URL}/reports/daily`;

    if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
    } else if (date) {
        url += `?date=${date}`;
    }

    const res = await fetch(url, { headers });
    return res.json();
};

// Download Reports
export const getDetailedWeeklyReport = async (date) => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/reports/download/weekly?date=${date}`, { headers });
    return res.blob();
};

export const getDetailedMonthlyReport = async (month) => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/reports/download/monthly?month=${month}`, { headers });
    return res.blob();
};

export const getDetailedProductProfitability = async (startDate, endDate) => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/reports/download/product-profitability?startDate=${startDate}&endDate=${endDate}`, { headers });
    return res.blob();
};

export const getDetailedDailyTrend = async (startDate, endDate) => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/reports/download/daily-trend?startDate=${startDate}&endDate=${endDate}`, { headers });
    return res.blob();
};

export const getDetailedMostProfitable = async (startDate, endDate) => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/reports/download/most-profitable?startDate=${startDate}&endDate=${endDate}`, { headers });
    return res.blob();
};

// Backward compatibility: export as api object
export const api = {
    getProducts,
    createProduct,
    addProduct: createProduct, // Legacy alias
    updateProduct,
    deleteProduct,
    getExpenses,
    createExpense,
    addExpense: createExpense, // Legacy alias
    updateExpense,
    deleteExpense,
    getProduction,
    createProduction,
    addProduction: createProduction, // Legacy alias
    updateProduction,
    deleteProduction,
    getSales,
    createSale,
    addSale: createSale, // Legacy alias
    updateSale,
    deleteSale,
    getWeeklyReport,
    getMonthlyReport,
    getProductProfitability,
    getDailyTrend,
    getMostProfitable,
    getDailyReport,
    getDetailedWeeklyReport,
    getDetailedMonthlyReport,
    getDetailedProductProfitability,
    getDetailedDailyTrend,
    getDetailedMostProfitable,
    // Business & Users
    getBusinesses: async () => {
        // Public route for registration, no auth headers needed
        const res = await fetch(`${API_URL}/businesses/active`);
        if (!res.ok) {
            throw new Error('Failed to fetch businesses');
        }
        return res.json();
    },
    // Businesses Management
    getAllBusinesses: async () => {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/businesses`, { headers });
        return res.json();
    },
    getBusinessById: async (id) => {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/businesses/${id}`, { headers });
        return res.json();
    },
    createBusiness: async (businessData) => {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/businesses`, {
            method: 'POST',
            headers,
            body: JSON.stringify(businessData),
        });
        return res.json();
    },
    updateBusiness: async (id, businessData) => {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/businesses/${id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(businessData),
        });
        return res.json();
    },
    deactivateBusiness: async (id) => {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/businesses/${id}`, {
            method: 'DELETE',
            headers,
        });
        return res.json();
    },
    // User Profile
    createProfile: async (profileData) => {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/users/profile`, {
            method: 'POST',
            headers,
            body: JSON.stringify(profileData),
        });
        return res.json();
    },
    getMyProfile: async () => {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/users/me`, { headers });
        return res.json();
    },
    getBusinessUsers: async () => {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/users`, { headers });
        return res.json();
    },
    // User Management (Admin/Super Admin)
    updateUserRole: async (userId, role) => {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
            throw new Error('No hay sesión activa');
        }

        const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-user-role`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ userId, newRole: role }),
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Error al actualizar rol');
        }

        return result;
    },
    updateUserStatus: async (userId, isActive) => {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/users/${userId}/status`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ isActive }),
        });
        return res.json();
    },
    assignUserToBusiness: async (userId, businessId) => {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/users/${userId}/business`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ businessId }),
        });
        return res.json();
    }
};

