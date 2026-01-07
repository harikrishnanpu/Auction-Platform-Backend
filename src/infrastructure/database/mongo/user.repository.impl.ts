import { IUserRepository } from "../../../domain/user/user.repository";
import { User, UserRole, UserStatus } from "../../../domain/user/user.entity";
import { Email } from "../../../domain/user/email.vo";
import { Password } from "../../../domain/user/password.vo";
import { UserId } from "../../../domain/user/user-id.vo";
import { UserModel } from "./user.schema";

export class MongoUserRepository implements IUserRepository {

    async save(user: User): Promise<void> {
        const userData = {
            _id: user.id,
            email: user.email.value,
            passwordHash: user.password.value,
            role: user.role,
            status: user.status
        };

        // Upsert equivalent
        await UserModel.findByIdAndUpdate(
            user.id,
            userData,
            { upsert: true, new: true }
        );
    }

    async findByEmail(email: Email): Promise<User | null> {
        const userDoc = await UserModel.findOne({ email: email.value });
        if (!userDoc) return null;
        return this.toDomain(userDoc);
    }

    async emailExists(email: Email): Promise<boolean> {
        const count = await UserModel.countDocuments({ email: email.value });
        return count > 0;
    }

    private toDomain(userDoc: any): User {
        const emailResult = Email.create(userDoc.email);
        const passwordResult = Password.create(userDoc.passwordHash);
        const userIdResult = UserId.create(userDoc._id);

        // We assume data in DB is valid for now, usually we log errors if reconstruction fails
        if (emailResult.isFailure || passwordResult.isFailure || userIdResult.isFailure) {
            throw new Error("Data Integrity Error: Could not reconstruct User from DB");
        }

        const userResult = User.create({
            email: emailResult.getValue(),
            password: passwordResult.getValue(),
            role: userDoc.role as UserRole,
            status: userDoc.status as UserStatus
        }, userIdResult.getValue());

        return userResult.getValue();
    }
}
