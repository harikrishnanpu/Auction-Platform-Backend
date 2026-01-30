"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetTokenService = void 0;
const uuid_1 = require("uuid");
class ResetTokenService {
    generateToken(length = 32) {
        return (0, uuid_1.v4)().replace(/-/g, '').slice(0, length);
    }
}
exports.ResetTokenService = ResetTokenService;
