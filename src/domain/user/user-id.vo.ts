import { ValueObject } from "../shared/value-object";
import { Result } from "../shared/result";
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';

interface UserIdProps {
    value: string;
}

export class UserId extends ValueObject<UserIdProps> {
    get value(): string {
        return this.props.value;
    }

    private constructor(props: UserIdProps) {
        super(props);
    }

    public static create(id?: string): Result<UserId> {
        if (id) {
            if (!uuidValidate(id)) {
                return Result.fail<UserId>("Invalid User ID format");
            }
            return Result.ok<UserId>(new UserId({ value: id }));
        }
        return Result.ok<UserId>(new UserId({ value: uuidv4() }));
    }
}
