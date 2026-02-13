



export class Result<T> {
    public readonly isSuccess: boolean;
    public readonly isFailure: boolean;
    public readonly error: string | null;
    private readonly _value: T | null;

    private constructor(
        isSuccess: boolean,
        error: string | null,
        value: T | null
    ) {
        this.isSuccess = isSuccess;
        this.isFailure = !isSuccess;
        this.error = error;
        this._value = value;
    }

    public static ok<T>(value: T): Result<T> {
        return new Result<T>(true, null, value);
    }

    public static fail<T>(error: string): Result<T> {
        return new Result<T>(false, error, null);
    }

    public getValue(): T {
        if (this.isFailure || this._value === null) {
            throw new Error(this.error ?? "Result is failure");
        }
        return this._value;
    }
}
