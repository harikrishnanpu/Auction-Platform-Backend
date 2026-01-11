import { Entity } from "../shared/entity";
import { Result } from "../shared/result";
import { UserId } from "./user-id.vo";
import { Email } from "./email.vo";
import { Password } from "./password.vo";
import { UserRegisteredDomainEvent } from "./user.events";

// UserRole might still be needed for Admin distinction, keeping it optionally
export enum UserRole {
    USER = 'USER',
    SELLER = 'SELLER',
    MODERATOR = 'MODERATOR',
    ADMIN = "ADMIN"
}

interface UserProps {
    name: string;
    email: Email;
    phone: string;
    address: string;
    avatar_url?: string;
    password: Password;
    roles: UserRole[];
    is_active: boolean;
    is_blocked: boolean;
    is_verified: boolean;
    created_at: Date;
}

export class User extends Entity<UserProps> {
    private _domainEvents: any[] = [];

    get name(): string { return this.props.name; }
    get email(): Email { return this.props.email; }
    get phone(): string { return this.props.phone; }
    get address(): string { return this.props.address; }
    get avatar_url(): string | undefined { return this.props.avatar_url; }
    get password(): Password { return this.props.password; }
    get roles(): UserRole[] { return this.props.roles; }
    get is_active(): boolean { return this.props.is_active; }
    get is_blocked(): boolean { return this.props.is_blocked; }
    get is_verified(): boolean { return this.props.is_verified; }
    get created_at(): Date { return this.props.created_at; }

    get domainEvents(): any[] { return this._domainEvents; }

    private constructor(props: UserProps, id?: UserId) {
        super(props, id ? id.value : undefined);
    }

    public static create(
        props: {
            name: string;
            email: Email;
            phone: string;
            address: string;
            avatar_url?: string;
            password: Password;
            roles?: UserRole[];
            is_active?: boolean;
            is_blocked?: boolean;
            is_verified?: boolean;
            created_at?: Date;
        },
        id?: UserId
    ): Result<User> {
        const user = new User(
            {
                name: props.name,
                email: props.email,
                phone: props.phone,
                address: props.address,
                avatar_url: props.avatar_url,
                password: props.password,
                roles: props.roles || [UserRole.USER],
                is_active: props.is_active ?? true,
                is_blocked: props.is_blocked ?? false,
                is_verified: props.is_verified ?? false,
                created_at: props.created_at || new Date()
            },
            id
        );

        if (!id) {
            user.addDomainEvent(new UserRegisteredDomainEvent(
                UserId.create(user.id).getValue(),
                user.email
            ));
        }

        return Result.ok<User>(user);
    }

    public hasRole(role: UserRole): boolean {
        return this.props.roles.includes(role);
    }

    public addRole(role: UserRole): void {
        if (!this.hasRole(role)) {
            this.props.roles.push(role);
        }
    }

    public removeRole(role: UserRole): void {
        this.props.roles = this.props.roles.filter(r => r !== role);
    }

    public verify(): void {
        this.props.is_verified = true;
    }

    private addDomainEvent(event: any): void {
        this._domainEvents.push(event);
    }

    public changePassword(newPassword: Password): void {
        this.props.password = newPassword;
    }

    public clearEvents(): void {
        this._domainEvents = [];
    }
}
