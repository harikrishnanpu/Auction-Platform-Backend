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
        const email = email_vo_1.Email.create(raw.email);
        const usrId = user_id_vo_1.UserId.create(raw.user_id);
        if (email.isFailure)
            return result_1.Result.fail(email.error);
        if (usrId.isFailure)
            return result_1.Result.fail(usrId.error);
        let password;
        if (raw.password_hash) {
            const passwordOrError = password_vo_1.Password.create(raw.password_hash);
            if (passwordOrError.isFailure)
                return result_1.Result.fail(passwordOrError.error);
            password = passwordOrError.getValue();
        }
        const roles = raw.UserRole
            ? raw.UserRole.map(r => r.role)
            : [user_entity_1.UserRole.USER];
        const usr = user_entity_1.User.create({
            name: raw.name,
            email: email.getValue(),
            phone: raw.phone || undefined,
            address: raw.address,
            avatar_url: raw.avatar_url || undefined,
            password: password,
            googleId: raw.google_id || undefined,
            roles: roles,
            is_active: raw.is_active,
            is_blocked: raw.is_blocked,
            is_verified: raw.is_verified,
            created_at: raw.created_at
        }, usrId.getValue().value);
        return usr;
    }
    static toPersistence(user) {
        return {
            user_id: user.id.toString(),
            name: user.name,
            email: user.email.value,
            phone: user.phone || null,
            address: user.address,
            avatar_url: user.avatar_url || null,
            password_hash: user.password?.value || null,
            google_id: user.googleId || null,
            is_active: user.is_active,
            is_blocked: user.is_blocked,
            is_verified: user.is_verified,
            updated_at: new Date(),
            created_at: user.created_at,
        };
    }
}
exports.UserMapper = UserMapper;
