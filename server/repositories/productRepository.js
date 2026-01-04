const sql = require('../db');

class ProductRepository {
    async findAll(userId, businessId) {
        const result = await sql`
            SELECT * FROM products 
            WHERE business_id = ${businessId} 
            ORDER BY name ASC
        `;
        return result;
    }

    async findById(id, userId, businessId) {
        const result = await sql`
            SELECT * FROM products 
            WHERE id = ${id} AND business_id = ${businessId}
        `;
        return result[0];
    }

    async create(productData, userId, businessId) {
        const { name, type } = productData;
        const result = await sql`
            INSERT INTO products (user_id, business_id, name, type) 
            VALUES (${userId}, ${businessId}, ${name}, ${type}) 
            RETURNING *
        `;
        return result[0];
    }

    async update(id, productData, userId, businessId) {
        const { name, type } = productData;
        const result = await sql`
            UPDATE products 
            SET name = ${name}, type = ${type}
            WHERE id = ${id} AND business_id = ${businessId}
            RETURNING *
        `;
        return result[0];
    }

    async delete(id, userId, businessId) {
        const result = await sql`
            DELETE FROM products 
            WHERE id = ${id} AND business_id = ${businessId}
            RETURNING id
        `;
        return result.length > 0;
    }
}

module.exports = new ProductRepository();
