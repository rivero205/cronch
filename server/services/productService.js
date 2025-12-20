const productRepository = require('../repositories/productRepository');

class ProductService {
    async getAllProducts() {
        return await productRepository.findAll();
    }

    async getProductById(id) {
        return await productRepository.findById(id);
    }
}

module.exports = new ProductService();
