const expenseRepository = require('../repositories/expenseRepository');

class ExpenseService {
    async getExpenses(filters = {}) {
        return await expenseRepository.findAll(filters);
    }

    async createExpense(expenseData) {
        // Aquí se puede agregar validaciones de negocio
        if (!expenseData.description || expenseData.description.trim() === '') {
            throw new Error('Description is required');
        }
        if (!expenseData.amount || expenseData.amount <= 0) {
            throw new Error('Amount must be greater than 0');
        }
        
        return await expenseRepository.create(expenseData);
    }
}

module.exports = new ExpenseService();
