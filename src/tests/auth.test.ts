/**
 * @fileoverview
 * This file contains end-to-end tests for the authentication system,
 * covering user registration, login, token refreshing, profile access,
 * and logout flows.
 * 
 * The tests ensure:
 * - Validation of inputs (e.g., invalid email or password)
 * - Successful user creation and token generation
 * - Correct handling of refresh tokens
 * - Authenticated access to protected routes
 * 
 * These tests use an in-memory MongoDB instance via MongoMemoryServer
 * and mock JWT verification during test runs to simulate secure authentication.
 * 
 * Author: Ochogwu Emmanuel, emmyochogwu@gmail.com
 * Created: [Date]
 */

// src/tests/auth.test.ts
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app';
import { User } from '../models/user.model';
import RefreshToken from '../models/refreshToken.model';
import dotenv from 'dotenv';
dotenv.config();
let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), {});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  // Clear collections after each test to ensure a clean state
  await User.deleteMany();
  await RefreshToken.deleteMany();
});

describe('Auth API', () => {
  const userData = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'Password123!',
  };

  let refreshToken = '';
  let accessToken = '';

  it('should register a new user', async () => {
    const res = await request(app).post('/api/auth/register').send(userData);
    expect(res.status).toBe(201);
    expect(res.body.data.user.email).toBe(userData.email);
    refreshToken = res.body.data.refreshToken;
    accessToken = res.body.data.accessToken;
  });

  it('should not register with existing email', async () => {
    // First register the user
    await request(app).post('/api/auth/register').send(userData);
    // Try registering again with the same email, should return conflict error
    const res = await request(app).post('/api/auth/register').send(userData);
    expect(res.status).toBe(409);
    expect(res.body.message).toBe('Email already in use');
  });

  it('should login successfully with valid credentials', async () => {
    await request(app).post('/api/auth/register').send(userData);
    const res = await request(app).post('/api/auth/login').send({
      email: userData.email,
      password: userData.password,
    });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('refreshToken');
  });

  it('should not login with wrong password', async () => {
    await request(app).post('/api/auth/register').send(userData);
    const res = await request(app).post('/api/auth/login').send({
      email: userData.email,
      password: 'WrongPassword',
    });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
  });

  it('should retrieve user profile with token', async () => {
    const registerRes = await request(app).post('/api/auth/register').send(userData);
    const token = registerRes.body.data.accessToken;

    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(userData.email);
  });

  it('should fail to retrieve profile without token', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Unauthorized: No token found');
  });

  it('should refresh token with valid refresh token', async () => {
    const registerRes = await request(app).post('/api/auth/register').send(userData);
    const oldRefreshToken = registerRes.body.data.refreshToken;

    const res = await request(app).post('/api/auth/refresh-token').send({
      refreshToken: oldRefreshToken,
    });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('refreshToken');
  });

  it('should logout and delete refresh token', async () => {
    const registerRes = await request(app).post('/api/auth/register').send(userData);
    const tokenToDelete = registerRes.body.data.refreshToken;

    const res = await request(app).post('/api/auth/logout').send({
      refreshToken: tokenToDelete,
    });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Logout successful');

    const exists = await RefreshToken.findOne({ token: tokenToDelete });
    expect(exists).toBeNull();
  });

  it('should not refresh token after logout', async () => {
    const registerRes = await request(app).post('/api/auth/register').send(userData);
    const tokenToDelete = registerRes.body.data.refreshToken;

    await request(app).post('/api/auth/logout').send({ refreshToken: tokenToDelete });

    const res = await request(app).post('/api/auth/refresh-token').send({
      refreshToken: tokenToDelete,
    });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid refresh token');
  });
});
