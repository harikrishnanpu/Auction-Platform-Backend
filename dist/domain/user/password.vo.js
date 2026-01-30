"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Password = void 0;
const value_object_1 = require("../shared/value-object");
const result_1 = require("../shared/result");
class Password extends value_object_1.ValueObject {
    get value() {
        return this.props.value;
    }
    constructor(props) {
        super(props);
    }
    static isHashed(password) {
        return password.startsWith("$2b$") || password.startsWith("$2a$");
    }
    static create(hashedPassword) {
        if (!hashedPassword || hashedPassword.length === 0) {
            return result_1.Result.fail("Password cannot be empty");
        }
        return result_1.Result.ok(new Password({ value: hashedPassword, hashed: true }));
    }
    static validate(rawPassword) {
        if (rawPassword.length < 6) {
            return result_1.Result.fail("Password must be at least 6 characters long");
        }
        return result_1.Result.ok(null);
    }
}
exports.Password = Password;
