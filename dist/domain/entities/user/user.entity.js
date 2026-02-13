"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.UserRole = void 0;
const result_1 = require("@result/result");
var UserRole;
(function (UserRole) {
    UserRole["USER"] = "USER";
    UserRole["SELLER"] = "SELLER";
    UserRole["MODERATOR"] = "MODERATOR";
    UserRole["ADMIN"] = "ADMIN";
})(UserRole || (exports.UserRole = UserRole = {}));
class User {
    constructor(props, id) {
        this.props = props;
        this.id = id;
    }
    static create(props, id) {
        if (props.roles.length === 0) {
            return result_1.Result.fail("User must have at least one role");
        }
        if (props.is_blocked && props.is_verified) {
            return result_1.Result.fail("User cannot be blocked and verified");
        }
        return result_1.Result.ok(new User(props, id));
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
    get is_profile_completed() { return this.props.is_profile_completed ?? false; }
    get created_at() { return this.props.created_at ?? new Date(); }
    verify() {
        this.props.is_verified = true;
    }
    completeProfile(phone, address) {
        this.props.phone = phone;
        this.props.address = address;
        this.props.is_profile_completed = true;
    }
    changePassword(password) {
        this.props.password = password;
    }
    update(props) {
        if (props.name)
            this.props.name = props.name;
        if (props.address)
            this.props.address = props.address;
        if (props.avatar_url)
            this.props.avatar_url = props.avatar_url;
        if (props.phone)
            this.props.phone = props.phone;
        if (props.email)
            this.props.email = props.email;
    }
    block() {
        this.props.is_blocked = true;
    }
    unblock() {
        this.props.is_blocked = false;
    }
    addRole(role) {
        if (!this.props.roles.includes(role)) {
            this.props.roles.push(role);
        }
    }
}
exports.User = User;
