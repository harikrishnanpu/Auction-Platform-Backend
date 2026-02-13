import { Result } from "@domain/result/result";

export class Phone {

    private constructor(private readonly _value: string) { }

    private static isValid(phone: string): boolean {
        const re = /^[6-9]\d{9}$/;
        return re.test(phone);
    }

    public static create(phone: string): Result<Phone> {
        const trimmedPhone = phone.trim();

        if (!this.isValid(trimmedPhone)) {
            return Result.fail<Phone>("Invalid phone number");
        }
        return Result.ok<Phone>(new Phone(trimmedPhone));
    }

    public getValue(): string {
        return this._value;
    }

}