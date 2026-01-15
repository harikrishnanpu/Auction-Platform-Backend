import { User } from "./user.entity";
import { Email } from "./email.vo";
import { UserId } from "./user-id.vo";

export interface IUserRepository {
    save(user: User): Promise<void>;
    findByEmail(email: Email): Promise<User | null>;
    findById(id: UserId): Promise<User | null>;
    findAll(page: number, limit: number): Promise<{ users: User[], total: number }>;
    emailExists(email: Email): Promise<boolean>;
    phoneExists(phone: string): Promise<boolean>;
    findByGoogleId(googleId: string): Promise<User | null>;
}
