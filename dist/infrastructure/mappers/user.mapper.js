"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMapper = void 0;
const user_entity_1 = require("@domain/entities/user/user.entity");
const email_vo_1 = require("@domain/value-objects/user/email.vo");
const phone_vo_1 = require("@domain/value-objects/user/phone.vo");
const password_vo_1 = require("@domain/value-objects/user/password.vo");
class UserMapper {
    static toDomain(raw) {
        const email = email_vo_1.Email.create(raw.email).getValue();
        let phone = null;
        if (raw.phone) {
            phone = phone_vo_1.Phone.create(raw.phone).getValue();
        }
        let passsword = null;
        if (raw.password_hash) {
            passsword = password_vo_1.Password.create(raw.password_hash).getValue();
        }
        const roles = raw.UserRole
            ? raw.UserRole.map(r => r.role)
            : [user_entity_1.UserRole.USER];
        const usr = user_entity_1.User.create({
            name: raw.name,
            email: email,
            phone: phone || undefined,
            address: raw.address,
            avatar_url: raw.avatar_url || undefined,
            password: passsword || undefined,
            googleId: raw.google_id || undefined,
            roles: roles,
            is_blocked: raw.is_blocked,
            is_verified: raw.is_verified,
            is_profile_completed: raw.is_profile_completed,
            created_at: raw.created_at
        }, raw.user_id);
        return usr;
    }
    static toPersistence(user) {
        return {
            user_id: user.id,
            name: user.name,
            email: user.email.getValue(),
            phone: user.phone?.getValue() || null,
            address: user.address,
            avatar_url: user.avatar_url || null,
            password_hash: user.password?.getValue() || null,
            google_id: user.googleId || null,
            is_blocked: user.is_blocked,
            is_verified: user.is_verified,
            is_profile_completed: user.is_profile_completed,
            updated_at: new Date(),
            created_at: user.created_at,
        };
    }
}
exports.UserMapper = UserMapper;
