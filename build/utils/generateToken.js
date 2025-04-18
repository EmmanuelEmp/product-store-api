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
exports.generateToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const crypto_1 = __importDefault(require("crypto"));
const refreshToken_model_1 = __importDefault(require("../models/refreshToken.model"));
const generateToken = (user) => __awaiter(void 0, void 0, void 0, function* () {
    if (!user || !user._id || !user.name || !user.email) {
        throw new Error("Invalid user data for token generation");
    }
    const payload = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
    };
    const accessToken = (0, jsonwebtoken_1.sign)(payload, process.env.JWT_SECRET, {
        expiresIn: "10m",
    });
    const refreshToken = crypto_1.default.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    yield refreshToken_model_1.default.create({
        token: refreshToken,
        user: user._id,
        expiresAt,
    });
    return { accessToken, refreshToken };
});
exports.generateToken = generateToken;
