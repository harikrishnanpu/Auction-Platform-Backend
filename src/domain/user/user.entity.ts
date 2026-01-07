import { Entity } from "../shared/entity";
import { Result } from "../shared/result";
import { UserId } from "./user-id.vo";
import { Email } from "./email.vo";
import { Password } from "./password.vo";
import { UserRegisteredDomainEvent } from "./user.events";

export enum UserRole {
    USER = 'USER',
    ADMIN = 'ADMIN'
}

export enum UserStatus {
    ACTIVE = 'ACTIVE',
    BLOCKED = 'BLOCKED'
}

interface UserProps {
    email: Email;
    password: Password;
    role: UserRole;
    status: UserStatus;
}

export class User extends Entity<UserProps> {
    private _domainEvents: any[] = []; // In a real system, use a stronger typed event list

    get email(): Email {
        return this.props.email;
    }

    get password(): Password {
        return this.props.password;
    }

    get role(): UserRole {
        return this.props.role;
    }

    get status(): UserStatus {
        return this.props.status;
    }

    get domainEvents(): any[] {
        return this._domainEvents;
    }

    private constructor(props: UserProps, id?: UserId) {
        super(props, id ? id.value : undefined);
    }

    public static create(
        props: { email: Email; password: Password; role?: UserRole; status?: UserStatus },
        id?: UserId
    ): Result<User> {
        const user = new User(
            {
                email: props.email,
                password: props.password,
                role: props.role || UserRole.USER,
                status: props.status || UserStatus.ACTIVE,
            },
            id
        );

        // If this is a new user (no ID passed implies new, usually), add event
        if (!id) {
            user.addDomainEvent(new UserRegisteredDomainEvent(
                UserId.create(user.id).getValue(),
                user.email
            ));
        }

        return Result.ok<User>(user);
    }

    private addDomainEvent(event: any): void {
        this._domainEvents.push(event);
    }

    public clearEvents(): void {
        this._domainEvents = [];
    }
}
