import { ValueObject } from "../shared/value-object";
import { Result } from "../shared/result";

interface EmailProps {
    value: string;
}

export class Email extends ValueObject<EmailProps> {
    get value(): string {
        return this.props.value;
    }

    private constructor(props: EmailProps) {
        super(props);
    }

    private static isValid(email: string): boolean {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    public static create(email: string): Result<Email> {
        const trimmedEmail = email.trim();
        if (!this.isValid(trimmedEmail)) {
            return Result.fail<Email>("Invalid email address");
        }
        return Result.ok<Email>(new Email({ value: trimmedEmail }));
    }
}
