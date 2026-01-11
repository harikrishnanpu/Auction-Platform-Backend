import { User as PrismaUser, Role } from "@prisma/client";
import { User, UserRole } from "../../../domain/user/user.entity";
import { Result } from "../../../domain/shared/result";
import { Email } from "../../../domain/user/email.vo";
import { UserId } from "../../../domain/user/user-id.vo";
import { Password } from "../../../domain/user/password.vo";

// Define the type expected from Prisma with included relation
type PrismaUserWithRoles = PrismaUser & { roles: { role: Role }[] };

export class UserMapper {
    public static toDomain(raw: PrismaUserWithRoles): Result<User> {
        const emailOrError = Email.create(raw.email);
        const passwordOrError = Password.create(raw.password_hash);
        const userIdOrError = UserId.create(raw.user_id);

        if (emailOrError.isFailure) return Result.fail<User>(emailOrError.error as string);
        if (passwordOrError.isFailure) return Result.fail<User>(passwordOrError.error as string);
        if (userIdOrError.isFailure) return Result.fail<User>(userIdOrError.error as string);

        const roles = raw.roles
            ? raw.roles.map(r => r.role as unknown as UserRole)
            : [UserRole.USER];

        const userOrError = User.create(
            {
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
            },
            userIdOrError.getValue()
        );

        userOrError.getValue().clearEvents();

        return userOrError;
    }

    public static toPersistence(user: User): PrismaUser {
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
        } as PrismaUser;
    }
}
