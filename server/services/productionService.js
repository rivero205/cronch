const productionRepository = require('../repositories/productionRepository');

class ProductionService {
    async getProduction(filters = {}) {
        return await productionRepository.findAll(filters);
    }

    async createProduction(productionData) {
        // Validaciones de negocio
        if (!productionData.product_id) {
            throw new Error('Product ID is required');
        }
        if (!productionData.quantity || productionData.quantity <= 0) {
            throw new Error('Quantity must be greater than 0');
        }
        if (!productionData.unit_cost || productionData.unit_cost <= 0) {
            throw new Error('Unit cost must be greater than 0');
        }
        
        return await productionRepository.create(productionData);
    }
}

module.exports = new ProductionService();
