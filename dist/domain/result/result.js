"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Result = void 0;
class Result {
    constructor(isSuccess, error, value) {
        this.isSuccess = isSuccess;
        this.isFailure = !isSuccess;
        this.error = error;
        this._value = value;
    }
    static ok(value) {
        return new Result(true, null, value);
    }
    static fail(error) {
        return new Result(false, error, null);
    }
    getValue() {
        if (this.isFailure || this._value === null) {
            throw new Error(this.error ?? "Result is failure");
        }
        return this._value;
    }
}
exports.Result = Result;
