"use strict";
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/tests/auth.test.ts
const supertest_1 = __importDefault(require("supertest"));
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const app_1 = __importDefault(require("../app"));
const user_model_1 = require("../models/user.model");
const refreshToken_model_1 = __importDefault(require("../models/refreshToken.model"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let mongoServer;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    mongoServer = yield mongodb_memory_server_1.MongoMemoryServer.create();
    yield mongoose_1.default.connect(mongoServer.getUri(), {});
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.disconnect();
    yield mongoServer.stop();
}));
afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
    // Clear collections after each test to ensure a clean state
    yield user_model_1.User.deleteMany();
    yield refreshToken_model_1.default.deleteMany();
}));
describe('Auth API', () => {
    const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
    };
    let refreshToken = '';
    let accessToken = '';
    it('should register a new user', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.default).post('/api/auth/register').send(userData);
        expect(res.status).toBe(201);
        expect(res.body.data.user.email).toBe(userData.email);
        refreshToken = res.body.data.refreshToken;
        accessToken = res.body.data.accessToken;
    }));
    it('should not register with existing email', () => __awaiter(void 0, void 0, void 0, function* () {
        // First register the user
        yield (0, supertest_1.default)(app_1.default).post('/api/auth/register').send(userData);
        // Try registering again with the same email, should return conflict error
        const res = yield (0, supertest_1.default)(app_1.default).post('/api/auth/register').send(userData);
        expect(res.status).toBe(409);
        expect(res.body.message).toBe('Email already in use');
    }));
    it('should login successfully with valid credentials', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(app_1.default).post('/api/auth/register').send(userData);
        const res = yield (0, supertest_1.default)(app_1.default).post('/api/auth/login').send({
            email: userData.email,
            password: userData.password,
        });
        expect(res.status).toBe(200);
        expect(res.body.data).toHaveProperty('accessToken');
        expect(res.body.data).toHaveProperty('refreshToken');
    }));
    it('should not login with wrong password', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(app_1.default).post('/api/auth/register').send(userData);
        const res = yield (0, supertest_1.default)(app_1.default).post('/api/auth/login').send({
            email: userData.email,
            password: 'WrongPassword',
        });
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Invalid credentials');
    }));
    it('should retrieve user profile with token', () => __awaiter(void 0, void 0, void 0, function* () {
        const registerRes = yield (0, supertest_1.default)(app_1.default).post('/api/auth/register').send(userData);
        const token = registerRes.body.data.accessToken;
        const res = yield (0, supertest_1.default)(app_1.default)
            .get('/api/auth/profile')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.data.user.email).toBe(userData.email);
    }));
    it('should fail to retrieve profile without token', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.default).get('/api/auth/profile');
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Unauthorized: No token found');
    }));
    it('should refresh token with valid refresh token', () => __awaiter(void 0, void 0, void 0, function* () {
        const registerRes = yield (0, supertest_1.default)(app_1.default).post('/api/auth/register').send(userData);
        const oldRefreshToken = registerRes.body.data.refreshToken;
        const res = yield (0, supertest_1.default)(app_1.default).post('/api/auth/refresh-token').send({
            refreshToken: oldRefreshToken,
        });
        expect(res.status).toBe(200);
        expect(res.body.data).toHaveProperty('accessToken');
        expect(res.body.data).toHaveProperty('refreshToken');
    }));
    it('should logout and delete refresh token', () => __awaiter(void 0, void 0, void 0, function* () {
        const registerRes = yield (0, supertest_1.default)(app_1.default).post('/api/auth/register').send(userData);
        const tokenToDelete = registerRes.body.data.refreshToken;
        const res = yield (0, supertest_1.default)(app_1.default).post('/api/auth/logout').send({
            refreshToken: tokenToDelete,
        });
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Logout successful');
        const exists = yield refreshToken_model_1.default.findOne({ token: tokenToDelete });
        expect(exists).toBeNull();
    }));
    it('should not refresh token after logout', () => __awaiter(void 0, void 0, void 0, function* () {
        const registerRes = yield (0, supertest_1.default)(app_1.default).post('/api/auth/register').send(userData);
        const tokenToDelete = registerRes.body.data.refreshToken;
        yield (0, supertest_1.default)(app_1.default).post('/api/auth/logout').send({ refreshToken: tokenToDelete });
        const res = yield (0, supertest_1.default)(app_1.default).post('/api/auth/refresh-token').send({
            refreshToken: tokenToDelete,
        });
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Invalid refresh token');
    }));
});
