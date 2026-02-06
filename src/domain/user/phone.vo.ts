import { Result } from "../shared/result";
import { ValueObject } from "../shared/value-object";


interface PhoneProps {
    value: string;
}

export class Phone extends ValueObject<PhoneProps> {

    get value(): string {
        return this.props.value;
    }

    constructor(props: PhoneProps) {
        super(props);
    }

    private static isValid(phone: string): boolean {
        const re = /^[6-9]\d{9}$/;
        return re.test(phone);
    }

    public static create(phone: string): Result<Phone> {
        const trimmedPhone = phone.trim();
        if (!this.isValid(trimmedPhone)) {
            return Result.fail<Phone>("Invalid phone number");
        }
        return Result.ok<Phone>(new Phone({ value: trimmedPhone }));
    }

}