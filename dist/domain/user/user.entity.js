"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.UserRole = void 0;
const entity_1 = require("../shared/entity");
const result_1 = require("../shared/result");
const user_id_vo_1 = require("./user-id.vo");
const user_events_1 = require("./user.events");
// UserRole might still be needed for Admin distinction, keeping it optionally
var UserRole;
(function (UserRole) {
    UserRole["USER"] = "USER";
    UserRole["SELLER"] = "SELLER";
    UserRole["MODERATOR"] = "MODERATOR";
    UserRole["ADMIN"] = "ADMIN";
})(UserRole || (exports.UserRole = UserRole = {}));
class User extends entity_1.Entity {
    get name() { return this.props.name; }
    get email() { return this.props.email; }
    get phone() { return this.props.phone; }
    get address() { return this.props.address; }
    get avatar_url() { return this.props.avatar_url; }
    get password() { return this.props.password; }
    get roles() { return this.props.roles; }
    get is_active() { return this.props.is_active; }
    get is_blocked() { return this.props.is_blocked; }
    get is_verified() { return this.props.is_verified; }
    get created_at() { return this.props.created_at; }
    get domainEvents() { return this._domainEvents; }
    constructor(props, id) {
        super(props, id ? id.value : undefined);
        this._domainEvents = [];
    }
    static create(props, id) {
        const user = new User({
            name: props.name,
            email: props.email,
            phone: props.phone,
            address: props.address,
            avatar_url: props.avatar_url,
            password: props.password,
            roles: props.roles || [UserRole.USER],
            is_active: props.is_active ?? true,
            is_blocked: props.is_blocked ?? false,
            is_verified: props.is_verified ?? false,
            created_at: props.created_at || new Date()
        }, id);
        return result_1.Result.ok(user);
    }
    hasRole(role) {
        return this.props.roles.includes(role);
    }
    addRole(role) {
        if (!this.hasRole(role)) {
            this.props.roles.push(role);
        }
    }
    removeRole(role) {
        this.props.roles = this.props.roles.filter(r => r !== role);
    }
    verify() {
        this.props.is_verified = true;
    }

}
exports.User = User;
