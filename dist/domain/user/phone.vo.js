"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Phone = void 0;
const result_1 = require("../shared/result");
const value_object_1 = require("../shared/value-object");
class Phone extends value_object_1.ValueObject {
    get value() {
        return this.props.value;
    }
    constructor(props) {
        super(props);
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
        return result_1.Result.ok(new Phone({ value: trimmedPhone }));
    }
}
exports.Phone = Phone;
