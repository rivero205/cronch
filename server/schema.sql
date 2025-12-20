-- Create Tables

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL -- 'comida', 'bebida', etc.
);

-- Expenses (Insumos) Table
CREATE TABLE IF NOT EXISTS expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE DEFAULT (CURRENT_DATE),
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL
);

-- Production Table
CREATE TABLE IF NOT EXISTS daily_production (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE DEFAULT (CURRENT_DATE),
    product_id INT,
    quantity INT NOT NULL,
    unit_cost DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Sales Table
CREATE TABLE IF NOT EXISTS daily_sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE DEFAULT (CURRENT_DATE),
    product_id INT,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Optional: Seed data
INSERT INTO products (name, type) VALUES 
('Empanada', 'comida'),
('Arepa de Huevo', 'comida'),
('Jugo Natural', 'bebida')
ON DUPLICATE KEY UPDATE name=name;

