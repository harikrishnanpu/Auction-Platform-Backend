"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Phone = void 0;
const result_1 = require("@domain/result/result");
class Phone {
    constructor(_value) {
        this._value = _value;
    }
    static isValid(phone) {
        const re = /^[6-9]\d{9}$/;
        return re.test(phone);
    }
    static create(phone) {
        const trimmedPhone = phone.trim();
        if (!this.isValid(trimmedPhone)) {
            return result_1.Result.fail("Invalid phone number");
        }
        return result_1.Result.ok(new Phone(trimmedPhone));
    }
    getValue() {
        return this._value;
    }
}
exports.Phone = Phone;
