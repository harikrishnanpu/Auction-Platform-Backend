import { User as PrismaUser, Role } from "@prisma/client";
import { User, UserRole } from "../../../domain/user/user.entity";
import { Result } from "../../../domain/shared/result";
import { Email } from "../../../domain/user/email.vo";
import { Password } from "../../../domain/user/password.vo";

type PrismaUserWithRoles = PrismaUser & { UserRole: { role: Role }[] };

export class UserMapper {
    public static toDomain(raw: PrismaUserWithRoles): Result<User> {
        const email = Email.create(raw.email);

        let password;
        if (raw.password_hash) {
            const passwordOrError = Password.create(raw.password_hash);
            if (passwordOrError.isFailure) return Result.fail<User>(passwordOrError.error as string);
            password = passwordOrError.getValue();
        }

        const roles = raw.UserRole
            ? raw.UserRole.map(r => r.role as unknown as UserRole)
            : [UserRole.USER];

        const usr = User.create(
            {
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
            },
            raw.user_id
        );


        return usr;
    }

    public static toPersistence(user: User): PrismaUser {
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
        } as PrismaUser;
    }
}
