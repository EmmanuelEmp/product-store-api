"use strict";
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
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = require("../utils/logger");
dotenv_1.default.config();
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if MONGO_URI is defined
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            logger_1.logger.error('MongoDB URI is missing. Please check your .env file.');
            process.exit(1); // Exit the process with failure
        }
        // Log the connection attempt
        logger_1.logger.info(`MONGO URI: ${mongoUri}`);
        // Connect to MongoDB with options
        const conn = yield mongoose_1.default.connect(mongoUri);
        // Log successful connection
        logger_1.logger.info('DB Connected');
    }
    catch (error) {
        logger_1.logger.error('Error connecting to DB: ', error);
        process.exit(1);
    }
});
exports.connectDB = connectDB;
