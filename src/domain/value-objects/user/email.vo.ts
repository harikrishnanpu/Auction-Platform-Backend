import { Result } from "@result/result";

export class Email {
    private constructor(private readonly _value: string) { }

    private static isValid(email: string): boolean {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    public static create(email: string): Result<Email> {
        const trimmedEmail = email.trim();

        if (!this.isValid(trimmedEmail)) {
            return Result.fail<Email>("Invalid email address");
        }

        return Result.ok(new Email(trimmedEmail));
    }

    public getValue(): string {
        return this._value;
    }

}
