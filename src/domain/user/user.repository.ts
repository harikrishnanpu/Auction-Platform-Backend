import { User } from "./user.entity";
import { Email } from "./email.vo";

export interface IUserRepository {
    save(user: User): Promise<void>;
    findByEmail(email: Email): Promise<User | null>;
    // findById(userId: UserId): Promise<User | null>; 
    emailExists(email: Email): Promise<boolean>;
}
