"use strict";
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
const supertest_1 = __importDefault(require("supertest"));
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("../app"));
const generateToken_1 = require("../utils/generateToken");
dotenv_1.default.config();
let mongo;
let productId;
const mockUserId = new mongoose_1.default.Types.ObjectId();
const token = `Bearer ${(0, generateToken_1.generateToken)({
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
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    mongo = yield mongodb_memory_server_1.MongoMemoryServer.create();
    yield mongoose_1.default.connect(mongo.getUri());
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.disconnect();
    yield mongo.stop();
}));
afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
    const db = mongoose_1.default.connection.db;
    if (!db) {
        throw new Error('Database connection is not established.');
    }
    const collections = yield db.collections();
    for (const collection of collections) {
        yield collection.deleteMany({});
    }
}));
describe('Product API', () => {
    it('should return an empty array when no products exist', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.default).get('/api/products');
        expect(res.status).toBe(200);
        expect(res.body.data).toEqual([]);
    }));
    it('should create a product with valid data', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.default)
            .post('/api/products')
            .set('Authorization', token)
            .send(productPayload);
        expect(res.status).toBe(201);
        expect(res.body.data.name).toBe(productPayload.name);
        productId = res.body.data._id;
        expect(productId).toBeDefined();
    }));
    it('should not create a product with invalid data', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.default)
            .post('/api/products')
            .set('Authorization', token)
            .send({ price: 'free' }); // invalid type
        expect(res.status).toBe(400);
    }));
    it('should get a product by ID', () => __awaiter(void 0, void 0, void 0, function* () {
        const createRes = yield (0, supertest_1.default)(app_1.default)
            .post('/api/products')
            .set('Authorization', token)
            .send(productPayload);
        const id = createRes.body.data._id;
        const res = yield (0, supertest_1.default)(app_1.default).get(`/api/products/${id}`);
        expect(res.status).toBe(200);
        expect(res.body.data._id).toBe(id);
    }));
    it('should return 400 for invalid product ID', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.default).get('/api/products/invalid-id');
        expect(res.status).toBe(400);
    }));
    it('should update a product', () => __awaiter(void 0, void 0, void 0, function* () {
        const createRes = yield (0, supertest_1.default)(app_1.default)
            .post('/api/products')
            .set('Authorization', token)
            .send(productPayload);
        const id = createRes.body.data._id;
        const res = yield (0, supertest_1.default)(app_1.default)
            .put(`/api/products/${id}`)
            .set('Authorization', token)
            .send(updatedPayload);
        expect(res.status).toBe(200);
        expect(res.body.data.name).toBe(updatedPayload.name);
    }));
    it('should return 400 for invalid update data', () => __awaiter(void 0, void 0, void 0, function* () {
        const createRes = yield (0, supertest_1.default)(app_1.default)
            .post('/api/products')
            .set('Authorization', token)
            .send(productPayload);
        const id = createRes.body.data._id;
        const res = yield (0, supertest_1.default)(app_1.default)
            .put(`/api/products/${id}`)
            .set('Authorization', token)
            .send({ price: 'invalid' }); // invalid type
        expect(res.status).toBe(400);
    }));
    it('should return 404 for updating non-existing product', () => __awaiter(void 0, void 0, void 0, function* () {
        const fakeId = new mongoose_1.default.Types.ObjectId().toString();
        const res = yield (0, supertest_1.default)(app_1.default)
            .put(`/api/products/${fakeId}`)
            .set('Authorization', token)
            .send(updatedPayload);
        expect(res.status).toBe(404);
    }));
    it('should delete a product', () => __awaiter(void 0, void 0, void 0, function* () {
        const createRes = yield (0, supertest_1.default)(app_1.default)
            .post('/api/products')
            .set('Authorization', token)
            .send(productPayload);
        const id = createRes.body.data._id;
        const res = yield (0, supertest_1.default)(app_1.default)
            .delete(`/api/products/${id}`)
            .set('Authorization', token);
        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/deleted successfully/i);
    }));
    it('should return 404 when deleting already deleted product', () => __awaiter(void 0, void 0, void 0, function* () {
        const createRes = yield (0, supertest_1.default)(app_1.default)
            .post('/api/products')
            .set('Authorization', token)
            .send(productPayload);
        const id = createRes.body.data._id;
        yield (0, supertest_1.default)(app_1.default)
            .delete(`/api/products/${id}`)
            .set('Authorization', token);
        const res = yield (0, supertest_1.default)(app_1.default)
            .delete(`/api/products/${id}`)
            .set('Authorization', token);
        expect(res.status).toBe(404);
    }));
});
