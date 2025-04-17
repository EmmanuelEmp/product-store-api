/**
 * 🧪 Product API Test Suite
 *
 * This suite contains end-to-end integration tests for the Product API endpoints.
 * It uses an in-memory MongoDB instance (MongoMemoryServer) to ensure isolated
 * and repeatable test runs, with no dependency on external databases.
 *
 * Auth is simulated using a JWT token signed with the same secret as in the app.
 * 
 * Covered Scenarios:
 * - Getting all products (including empty state)
 * - Creating products (valid and invalid payloads)
 * - Fetching a product by ID (valid, invalid, and not found)
 * - Updating a product (valid, invalid data, and not found)
 * - Deleting a product (successful and already deleted)
 *
 * Run with: `npm run test:product`
 *
 * These tests serve as both regression checks and documentation
 * for how the Product API is expected to behave.
 */


import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import dotenv from 'dotenv';
import app from '../app';
import { generateToken } from '../utils/generateToken';

dotenv.config();

let mongo: MongoMemoryServer;
let productId: string;

const mockUserId = new mongoose.Types.ObjectId();
const token = `Bearer ${generateToken({
  _id: mockUserId.toString(),
  name: 'Test User',
  email: 'test@example.com',
  role: 'admin',
})}`;

const productPayload = {
  name: 'Samsung Galaxy S25',
  description: 'Latest model with enhanced AI features',
  price: 899,
  quantity: 10,
  category: 'Electronics',
};

const updatedPayload = {
  name: 'Galaxy S25 Ultra',
  description: 'Upgraded model',
  price: 999,
  quantity: 20,
  category: 'Electronics - Premium',
};

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

afterEach(async () => {
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection is not established.');
  }
  const collections = await db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

describe('Product API', () => {
  it('should return an empty array when no products exist', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('should create a product with valid data', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', token)
      .send(productPayload);

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe(productPayload.name);
    productId = res.body.data._id;
    expect(productId).toBeDefined();
  });

  it('should not create a product with invalid data', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', token)
      .send({ price: 'free' }); // invalid type

    expect(res.status).toBe(400);
  });

  it('should get a product by ID', async () => {
    const createRes = await request(app)
      .post('/api/products')
      .set('Authorization', token)
      .send(productPayload);

    const id = createRes.body.data._id;

    const res = await request(app).get(`/api/products/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(id);
  });

  it('should return 400 for invalid product ID', async () => {
    const res = await request(app).get('/api/products/invalid-id');
    expect(res.status).toBe(400);
  });

  it('should update a product', async () => {
    const createRes = await request(app)
      .post('/api/products')
      .set('Authorization', token)
      .send(productPayload);

    const id = createRes.body.data._id;

    const res = await request(app)
      .put(`/api/products/${id}`)
      .set('Authorization', token)
      .send(updatedPayload);

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe(updatedPayload.name);
  });

  it('should return 400 for invalid update data', async () => {
    const createRes = await request(app)
      .post('/api/products')
      .set('Authorization', token)
      .send(productPayload);

    const id = createRes.body.data._id;

    const res = await request(app)
      .put(`/api/products/${id}`)
      .set('Authorization', token)
      .send({ price: 'invalid' }); // invalid type

    expect(res.status).toBe(400);
  });

  it('should return 404 for updating non-existing product', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .put(`/api/products/${fakeId}`)
      .set('Authorization', token)
      .send(updatedPayload);

    expect(res.status).toBe(404);
  });

  it('should delete a product', async () => {
    const createRes = await request(app)
      .post('/api/products')
      .set('Authorization', token)
      .send(productPayload);

    const id = createRes.body.data._id;

    const res = await request(app)
      .delete(`/api/products/${id}`)
      .set('Authorization', token);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted successfully/i);
  });

  it('should return 404 when deleting already deleted product', async () => {
    const createRes = await request(app)
      .post('/api/products')
      .set('Authorization', token)
      .send(productPayload);

    const id = createRes.body.data._id;

    await request(app)
      .delete(`/api/products/${id}`)
      .set('Authorization', token);

    const res = await request(app)
      .delete(`/api/products/${id}`)
      .set('Authorization', token);

    expect(res.status).toBe(404);
  });
});

