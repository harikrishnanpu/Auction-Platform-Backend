"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Password = void 0;
const result_1 = require("@domain/result/result");
class Password {
    constructor(_password) {
        this._password = _password;
    }
    static validate(rawPassword) {
        if (rawPassword.length < 6) {
            return result_1.Result.fail("Password must be at least 6 characters long");
        }
        return result_1.Result.ok(null);
    }
    static create(hashedPassword) {
        if (!hashedPassword || hashedPassword.length === 0) {
            return result_1.Result.fail("Password cannot be empty");
        }
        return result_1.Result.ok(new Password(hashedPassword));
    }
    getValue() {
        return this._password;
    }
}
exports.Password = Password;
