import bcrypt from 'bcrypt';
import { IPasswordHasher } from '../../application/services/auth/auth.service';

export class BcryptPasswordHasher implements IPasswordHasher {
    private readonly saltRounds = 10;

    async hash(password: string): Promise<string> {
        return await bcrypt.hash(password, this.saltRounds);
    }

    async compare(plain: string, hashed: string): Promise<boolean> {
        return await bcrypt.compare(plain, hashed);
    }
}
