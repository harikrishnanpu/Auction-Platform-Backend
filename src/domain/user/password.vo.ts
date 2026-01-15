import { ValueObject } from "../shared/value-object";
import { Result } from "../shared/result";

interface PasswordProps {
    value: string;
    hashed: boolean;
}

export class Password extends ValueObject<PasswordProps> {
    get value(): string {
        return this.props.value;
    }

    private constructor(props: PasswordProps) {
        super(props);
    }

    public static isHashed(password: string): boolean {
        return password.startsWith("$2b$") || password.startsWith("$2a$");
    }

    public static create(hashedPassword: string): Result<Password> {
        if (!hashedPassword || hashedPassword.length === 0) {
            return Result.fail<Password>("Password cannot be empty");
        }
        
        return Result.ok<Password>(new Password({ value: hashedPassword, hashed: true }));
    }

    public static validate(rawPassword: string): Result<null> {
        if (rawPassword.length < 6) {
            return Result.fail<null>("Password must be at least 6 characters long");
        }
        return Result.ok<null>(null);
    }
}
