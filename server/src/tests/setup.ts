import { Pool } from 'mysql2/promise';

// Test database configuration
const testConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'flower_ecommerce_test',
  connectionLimit: 5,
};

// Create test database connection
export const testPool = new Pool(testConfig);

// Setup test database
beforeAll(async () => {
  try {
    // Create test database if it doesn't exist
    const connection = await testPool.getConnection();
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${testConfig.database}`);
    await connection.execute(`USE ${testConfig.database}`);
    connection.release();
  } catch (error) {
    console.error('Test database setup failed:', error);
  }
});

// Cleanup after each test
afterEach(async () => {
  try {
    const connection = await testPool.getConnection();
    
    // Clear all tables
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    await connection.execute('TRUNCATE TABLE order_items');
    await connection.execute('TRUNCATE TABLE orders');
    await connection.execute('TRUNCATE TABLE cart_items');
    await connection.execute('TRUNCATE TABLE products');
    await connection.execute('TRUNCATE TABLE categories');
    await connection.execute('TRUNCATE TABLE users');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    
    connection.release();
  } catch (error) {
    console.error('Test cleanup failed:', error);
  }
});

// Close database connection after all tests
afterAll(async () => {
  try {
    await testPool.end();
  } catch (error) {
    console.error('Test database cleanup failed:', error);
  }
});
