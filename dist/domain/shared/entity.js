"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Entity = void 0;
const uuid_1 = require("uuid");
const isEntity = (v) => {
    return v instanceof Entity;
};
class Entity {
    constructor(props, id) {
        this._id = id ? id : (0, uuid_1.v4)();
        this.props = props;
    }
    get id() {
        return this._id;
    }
    equals(object) {
        if (object == null || object == undefined) {
            return false;
        }
        if (this === object) {
            return true;
        }
        if (!isEntity(object)) {
            return false;
        }
        return this._id === object._id;
    }
}
exports.Entity = Entity;
