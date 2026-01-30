"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.UserRole = void 0;
const entity_1 = require("../shared/entity");
const result_1 = require("../shared/result");
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
    get is_active() { return this.props.is_active; }
    get is_blocked() { return this.props.is_blocked; }
    get is_verified() { return this.props.is_verified; }
    get created_at() { return this.props.created_at || new Date(); }
    verify() {
        this.props.is_verified = true;
    }
    changePassword(newPassword) {
        this.props.password = newPassword;
    }
    addRole(role) {
        this.props.roles.push(role);
    }
}
exports.User = User;
