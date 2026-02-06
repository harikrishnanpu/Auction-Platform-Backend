import { User } from "./user.entity";
import { Email } from "./email.vo";
import { Phone } from "./phone.vo";

export interface IUserRepository {
    save(user: User): Promise<void>;
    findByEmail(email: Email): Promise<User | null>;
    findById(id: string): Promise<User | null>;

    findByGoogleId(googleId: string): Promise<User | null>;
    findAll(page: number, limit: number, search?: string, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<{ users: User[], total: number }>;


    emailExists(email: Email): Promise<boolean>;
    phoneExists(phone: Phone): Promise<boolean>;

    update(id: string, data: User): Promise<User>;

    delete(id: string): Promise<void>;

    countAll(): Promise<number>;
    countSellers(): Promise<number>;
    countBlocked(): Promise<number>;

    findSellers(
        page: number,
        limit: number,
        search?: string,
        sortBy?: string,
        sortOrder?: 'asc' | 'desc',
        kycStatus?: string
    ): Promise<{ sellers: any[], total: number }>;
}
