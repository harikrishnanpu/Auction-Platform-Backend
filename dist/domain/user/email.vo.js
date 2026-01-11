"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Email = void 0;
const value_object_1 = require("../shared/value-object");
const result_1 = require("../shared/result");
class Email extends value_object_1.ValueObject {
    get value() {
        return this.props.value;
    }
    constructor(props) {
        super(props);
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
        return result_1.Result.ok(new Email({ value: trimmedEmail }));
    }
}
exports.Email = Email;
