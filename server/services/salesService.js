const salesRepository = require('../repositories/salesRepository');

class SalesService {
    async getSales(filters = {}) {
        return await salesRepository.findAll(filters);
    }

    async createSale(saleData) {
        // Validaciones de negocio
        if (!saleData.product_id) {
            throw new Error('Product ID is required');
        }
        if (!saleData.quantity || saleData.quantity <= 0) {
            throw new Error('Quantity must be greater than 0');
        }
        if (!saleData.unit_price || saleData.unit_price <= 0) {
            throw new Error('Unit price must be greater than 0');
        }
        
        return await salesRepository.create(saleData);
    }
}

module.exports = new SalesService();
