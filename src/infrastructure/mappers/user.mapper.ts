import { User as PrismaUser, Role } from "@prisma/client";
import { User, UserRole } from "@domain/entities/user/user.entity";
import { Result } from "@result/result";
import { Email } from "@domain/value-objects/user/email.vo";
import { Phone } from "@domain/value-objects/user/phone.vo";
import { Password } from "@domain/value-objects/user/password.vo";

type PrismaUserWithRoles = PrismaUser & { UserRole: { role: Role }[] };

export class UserMapper {

    public static toDomain(raw: PrismaUserWithRoles): Result<User> {
        const email = Email.create(raw.email).getValue();

        let phone: Phone | null = null;
        if (raw.phone) {
            phone = Phone.create(raw.phone).getValue();
        }

        let passsword: Password | null = null;
        if (raw.password_hash) {
            passsword = Password.create(raw.password_hash).getValue();
        }

        const roles = raw.UserRole
            ? raw.UserRole.map(r => r.role as UserRole)
            : [UserRole.USER];

        const usr = User.create(
            {
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
            },
            raw.user_id
        );

        return usr;
    }

    public static toPersistence(user: User) {
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
