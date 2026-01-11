"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMapper = void 0;
const user_entity_1 = require("../../../domain/user/user.entity");
const result_1 = require("../../../domain/shared/result");
const email_vo_1 = require("../../../domain/user/email.vo");
const user_id_vo_1 = require("../../../domain/user/user-id.vo");
const password_vo_1 = require("../../../domain/user/password.vo");
class UserMapper {
    static toDomain(raw) {
        const emailOrError = email_vo_1.Email.create(raw.email);
        const passwordOrError = password_vo_1.Password.create(raw.password_hash);
        const userIdOrError = user_id_vo_1.UserId.create(raw.user_id);
        if (emailOrError.isFailure)
            return result_1.Result.fail(emailOrError.error);
        if (passwordOrError.isFailure)
            return result_1.Result.fail(passwordOrError.error);
        if (userIdOrError.isFailure)
            return result_1.Result.fail(userIdOrError.error);
        const roles = raw.roles
            ? raw.roles.map(r => r.role)
            : [user_entity_1.UserRole.USER];
        const userOrError = user_entity_1.User.create({
            name: raw.name,
            email: emailOrError.getValue(),
            phone: raw.phone,
            address: raw.address,
            avatar_url: raw.avatar_url || undefined,
            password: passwordOrError.getValue(),
            roles: roles,
            is_active: raw.is_active,
            is_blocked: raw.is_blocked,
            is_verified: raw.is_verified,
            created_at: raw.created_at
        }, userIdOrError.getValue());
        userOrError.getValue().clearEvents();
        return userOrError;
    }
    static toPersistence(user) {
        return {
            user_id: user.id.toString(),
            name: user.name,
            email: user.email.value,
            phone: user.phone,
            address: user.address,
            avatar_url: user.avatar_url || null,
            password_hash: user.password.value,
            // role is removed from scalar User table
            is_active: user.is_active,
            is_blocked: user.is_blocked,
            is_verified: user.is_verified,
            assigned_at: new Date(), // This might be legacy, maybe user.assigned_at if entity has it? Entity has NO assigned_at getter.
            created_at: user.created_at,
        };
    }
}
exports.UserMapper = UserMapper;
