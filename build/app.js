"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const error_middleware_1 = require("./middleware/error.middleware");
class App {
    constructor() {
        this.app = (0, express_1.default)();
        this.setMiddleware();
        this.setRoutes();
        this.setErrorHandling();
    }
    setMiddleware() {
        // Global rate limiter (can scope to /api/auth if needed)
        const limiter = (0, express_rate_limit_1.default)({
            windowMs: 15 * 60 * 1000,
            max: 100,
            message: 'Too many requests from this IP, please try again later.',
            standardHeaders: true,
            legacyHeaders: false,
        });
        this.app.use(limiter);
        this.app.use((0, cors_1.default)());
        this.app.use((0, helmet_1.default)());
        this.app.use((0, morgan_1.default)('dev'));
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: true }));
    }
    setRoutes() {
        this.app.get('/', (req, res) => {
            res.json({ message: 'Welcome to the API!' });
        });
        this.app.use('/api/auth', auth_routes_1.default);
        this.app.use('/api/products', product_routes_1.default);
    }
    setErrorHandling() {
        // Handle unknown routes
        this.app.use((req, res) => {
            res.status(404).json({ message: 'Route not found' });
        });
        // Central error handler
        this.app.use(error_middleware_1.errorHandler);
    }
}
exports.default = new App().app;
