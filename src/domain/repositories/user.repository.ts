import { User } from "@domain/entities/user/user.entity";
import { Email } from "@domain/value-objects/user/email.vo";
import { Phone } from "@domain/value-objects/user/phone.vo";

export interface IUserRepository {
    save(user: User): Promise<void>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: Email): Promise<User | null>;
    findByPhone(phone: Phone): Promise<User | null>;
    findByPhoneOrEmail(phone: Phone, email: Email): Promise<User | null>;
    findByGoogleId(googleId: string): Promise<User | null>;
    findAll(page: number, limit: number, search?: string, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<{ users: User[], total: number }>;
    findSellers(page: number, limit: number, search?: string, sortBy?: string, sortOrder?: 'asc' | 'desc', kycStatus?: string): Promise<{ sellers: User[], total: number }>;
    countAll(): Promise<number>;
    countSellers(): Promise<number>;
    countBlocked(): Promise<number>;
    delete(id: string): Promise<void>;
}