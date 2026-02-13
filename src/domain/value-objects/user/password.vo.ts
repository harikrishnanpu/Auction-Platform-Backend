import { Result } from "@domain/result/result";



export class Password {
    private constructor(private readonly _password: string) { }



    public static validate(rawPassword: string): Result<null> {
        if (rawPassword.length < 6) {
            return Result.fail<null>("Password must be at least 6 characters long");
        }
        return Result.ok<null>(null);
    }


    public static create(hashedPassword: string): Result<Password> {

        if (!hashedPassword || hashedPassword.length === 0) {
            return Result.fail<Password>("Password cannot be empty");
        }

        return Result.ok<Password>(new Password(hashedPassword));
    }

    public getValue(): string {
        return this._password;
    }

}
