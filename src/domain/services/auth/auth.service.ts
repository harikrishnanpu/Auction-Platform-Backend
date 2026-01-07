export interface IPasswordHasher {
    hash(password: string): Promise<string>;
    compare(plain: string, hashed: string): Promise<boolean>;
}

export interface IJwtService {
    sign(payload: object): string;
    verify(token: string): any;
}
