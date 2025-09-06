CREATE DATABASE IF NOT EXISTS flower_ecommerce;
USE flower_ecommerce;
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role ENUM('client', 'admin') DEFAULT 'client',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_is_active (is_active)
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_is_active (is_active)
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category_id INT,
    image_url VARCHAR(500),
    stock_quantity INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_name (name),
    INDEX idx_category (category_id),
    INDEX idx_price (price),
    INDEX idx_stock (stock_quantity),
    INDEX idx_is_active (is_active),
    FULLTEXT idx_search (name, description)
);

-- Cart items table
CREATE TABLE IF NOT EXISTS cart_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product (user_id, product_id),
    INDEX idx_user (user_id),
    INDEX idx_product (product_id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    shipping_address TEXT NOT NULL,
    billing_address TEXT,
    payment_method VARCHAR(50),
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_order_number (order_number),
    INDEX idx_status (status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_created_at (created_at)
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_order (order_id),
    INDEX idx_product (product_id)
);

-- Insert sample categories
INSERT INTO categories (name, description, image_url) VALUES
('Roses', 'Beautiful roses in various colors', 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=400'),
('Tulips', 'Colorful tulips for spring', 'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=400'),
('Lilies', 'Elegant lilies for special occasions', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400'),
('Sunflowers', 'Bright sunflowers to brighten your day', 'https://images.unsplash.com/photo-1597848212624-e19c2b0a0b0e?w=400'),
('Orchids', 'Exotic orchids for sophisticated taste', 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400'),
('Mixed Bouquets', 'Beautiful mixed flower arrangements', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400');

-- Insert sample products
INSERT INTO products (name, description, price, category_id, image_url, stock_quantity) VALUES
('Red Rose Bouquet', 'A dozen beautiful red roses', 29.99, 1, 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=400', 50),
('White Rose Bouquet', 'Elegant white roses', 32.99, 1, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', 30),
('Pink Tulip Bouquet', 'Fresh pink tulips', 24.99, 2, 'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=400', 40),
('Yellow Sunflower Bouquet', 'Bright yellow sunflowers', 19.99, 4, 'https://images.unsplash.com/photo-1597848212624-e19c2b0a0b0e?w=400', 25),
('White Lily Bouquet', 'Pure white lilies', 35.99, 3, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', 20),
('Purple Orchid Plant', 'Exotic purple orchid', 45.99, 5, 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400', 15),
('Mixed Spring Bouquet', 'Colorful spring flowers', 27.99, 6, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', 35),
('Premium Rose Arrangement', 'Luxury rose arrangement', 59.99, 1, 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=400', 10);

-- Insert sample admin user (password: admin123)
INSERT INTO users (email, password, first_name, last_name, role) VALUES
('admin@flowerecommerce.com', '$2a$12$IrbNIbbQc8Nt3j/riAyEeucNc9KfY5GlUo1LAJMeIqjp2uu46A8pS', 'Admin', 'User', 'admin');

-- Insert sample client user (password: client123)
INSERT INTO users (email, password, first_name, last_name, phone) VALUES
('client@example.com', '$2a$12$I2qw9mmno8uikg7h/F1DTOA4CTeElM1AcWA5Ijk16OhuZqXgb812e', 'John', 'Doe', '+1234567890');

-- Create indexes for better performance
CREATE INDEX idx_products_price_range ON products(price);
CREATE INDEX idx_orders_date_range ON orders(created_at);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Create views for common queries
CREATE VIEW active_products AS
SELECT p.*, c.name as category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.is_active = true;

CREATE VIEW order_summary AS
SELECT 
    o.id,
    o.order_number,
    o.total_amount,
    o.status,
    o.payment_status,
    o.created_at,
    u.first_name,
    u.last_name,
    u.email
FROM orders o
JOIN users u ON o.user_id = u.id;

-- Create stored procedures
DELIMITER //

CREATE PROCEDURE GetProductStats()
BEGIN
    SELECT 
        COUNT(*) as total_products,
        SUM(stock_quantity) as total_stock,
        AVG(price) as average_price,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_products
    FROM products;
END //

CREATE PROCEDURE GetOrderStats()
BEGIN
    SELECT 
        COUNT(*) as total_orders,
        SUM(total_amount) as total_revenue,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
        COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_orders
    FROM orders;
END //

DELIMITER ;
