"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BcryptPasswordHasher = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
class BcryptPasswordHasher {
    constructor() {
        this.saltRounds = 10;
    }
    async hash(password) {
        return await bcrypt_1.default.hash(password, this.saltRounds);
    }
    async compare(plain, hashed) {
        return await bcrypt_1.default.compare(plain, hashed);
    }
}
exports.BcryptPasswordHasher = BcryptPasswordHasher;
