"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserId = void 0;
const value_object_1 = require("../shared/value-object");
const result_1 = require("../shared/result");
const uuid_1 = require("uuid");
class UserId extends value_object_1.ValueObject {
    get value() {
        return this.props.value;
    }
    constructor(props) {
        super(props);
    }
    static create(id) {
        if (id) {
            if (!(0, uuid_1.validate)(id)) {
                return result_1.Result.fail("Invalid User ID format");
            }
            return result_1.Result.ok(new UserId({ value: id }));
        }
        return result_1.Result.ok(new UserId({ value: (0, uuid_1.v4)() }));
    }
}
exports.UserId = UserId;
