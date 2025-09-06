import request from 'supertest';
import express from 'express';
import { ProductController } from '../controllers/productController';
import { ProductService } from '../services/productService';
import { testPool } from './setup';

const app = express();
app.use(express.json());

// Mock routes for testing
app.get('/products', ProductController.getProducts);
app.get('/products/:id', ProductController.getProductById);

describe('Products', () => {
  beforeEach(async () => {
    // Setup test data
    const connection = await testPool.getConnection();
    
    // Insert test category
    await connection.execute(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      ['Test Category', 'Test category description']
    );
    
    // Insert test products
    await connection.execute(
      'INSERT INTO products (name, description, price, category_id, stock_quantity) VALUES (?, ?, ?, ?, ?)',
      ['Test Product 1', 'Test product description', 29.99, 1, 10]
    );
    
    await connection.execute(
      'INSERT INTO products (name, description, price, category_id, stock_quantity) VALUES (?, ?, ?, ?, ?)',
      ['Test Product 2', 'Another test product', 39.99, 1, 5]
    );
    
    connection.release();
  });

  describe('GET /products', () => {
    it('should get all products', async () => {
      const response = await request(app)
        .get('/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination).toBeDefined();
    });

    it('should filter products by category', async () => {
      const response = await request(app)
        .get('/products?category_id=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should search products by name', async () => {
      const response = await request(app)
        .get('/products?search=Test Product 1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Test Product 1');
    });

    it('should filter products by price range', async () => {
      const response = await request(app)
        .get('/products?min_price=30&max_price=50')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Test Product 2');
    });

    it('should paginate products', async () => {
      const response = await request(app)
        .get('/products?page=1&limit=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(1);
    });
  });

  describe('GET /products/:id', () => {
    it('should get product by ID', async () => {
      const response = await request(app)
        .get('/products/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(1);
      expect(response.body.data.name).toBe('Test Product 1');
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .get('/products/999')
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid product ID', async () => {
      const response = await request(app)
        .get('/products/invalid')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
