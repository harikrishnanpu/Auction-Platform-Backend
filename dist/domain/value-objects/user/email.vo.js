"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Email = void 0;
const result_1 = require("@result/result");
class Email {
    constructor(_value) {
        this._value = _value;
    }
    static isValid(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    static create(email) {
        const trimmedEmail = email.trim();
        if (!this.isValid(trimmedEmail)) {
            return result_1.Result.fail("Invalid email address");
        }
        return result_1.Result.ok(new Email(trimmedEmail));
    }
    getValue() {
        return this._value;
    }
}
exports.Email = Email;
