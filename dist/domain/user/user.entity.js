"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.UserRole = void 0;
const entity_1 = require("../shared/entity");
const result_1 = require("../shared/result");
const phone_vo_1 = require("./phone.vo");
var UserRole;
(function (UserRole) {
    UserRole["USER"] = "USER";
    UserRole["SELLER"] = "SELLER";
    UserRole["MODERATOR"] = "MODERATOR";
    UserRole["ADMIN"] = "ADMIN";
})(UserRole || (exports.UserRole = UserRole = {}));
class User extends entity_1.Entity {
    constructor(props, id) {
        super(props, id);
    }
    static create(props, id) {
        if (!props.roles || props.roles.length === 0) {
            return result_1.Result.fail("User must have at least one role");
        }
        const user = new User(props, id);
        return result_1.Result.ok(user);
    }
    get name() { return this.props.name; }
    get email() { return this.props.email; }
    get phone() { return this.props.phone; }
    get address() { return this.props.address; }
    get avatar_url() { return this.props.avatar_url; }
    get password() { return this.props.password; }
    get googleId() { return this.props.googleId; }
    get roles() { return this.props.roles; }
    get is_blocked() { return this.props.is_blocked; }
    get is_verified() { return this.props.is_verified; }
    get created_at() { return this.props.created_at || new Date(); }
    get is_profile_completed() { return this.props.is_profile_completed || false; }
    verify() {
        this.props.is_verified = true;
    }
    changePassword(newPassword) {
        this.props.password = newPassword;
    }
    addRole(role) {
        this.props.roles.push(role);
    }
    completeProfile(phone, address) {
        const phoneResult = phone_vo_1.Phone.create(phone);
        if (phoneResult.isFailure) {
            return result_1.Result.fail(phoneResult.error);
        }
        const normalizedAddress = address.trim();
        if (!normalizedAddress) {
            return result_1.Result.fail("Address is required");
        }
        this.props.phone = phoneResult.getValue().value;
        this.props.address = normalizedAddress;
        this.props.is_profile_completed = true;
        return result_1.Result.ok();
    }
}
exports.User = User;
