import { Entity } from "../shared/entity";
import { Result } from "../shared/result";
import { UserId } from "./user-id.vo";
import { Email } from "./email.vo";
import { Password } from "./password.vo";

export enum UserRole {
    USER = 'USER',
    SELLER = 'SELLER',
    MODERATOR = 'MODERATOR',
    ADMIN = "ADMIN"
}

interface UserProps {
    name: string;
    email: Email;
    phone?: string;
    address: string;
    avatar_url?: string;
    password?: Password;
    googleId?: string;
    roles: UserRole[];
    is_active: boolean;
    is_blocked: boolean;
    is_verified: boolean;
    created_at?: Date;
}

export class User extends Entity<UserProps> {

    private constructor(props: UserProps, id?: string) {
        super(props, id);
    }

    public static create(
        props: UserProps,
        id?: string
    ): Result<User> {

        if (!props.roles || props.roles.length === 0) {
            return Result.fail<User>("User must have at least one role");
        }

        const user = new User(props, id);
        return Result.ok<User>(user);
    }

    public get name(): string { return this.props.name; }
    public get email(): Email { return this.props.email; }
    public get phone(): string | undefined { return this.props.phone; }
    public get address(): string { return this.props.address; }
    public get avatar_url(): string | undefined { return this.props.avatar_url; }
    public get password(): Password | undefined { return this.props.password; }
    public get googleId(): string | undefined { return this.props.googleId; }
    public get roles(): UserRole[] { return this.props.roles; }
    public get is_active(): boolean { return this.props.is_active; }
    public get is_blocked(): boolean { return this.props.is_blocked; }
    public get is_verified(): boolean { return this.props.is_verified; }
    public get created_at(): Date { return this.props.created_at || new Date(); }

    public verify(): void {
        this.props.is_verified = true;
    }

    public changePassword(newPassword: Password): void {
        this.props.password = newPassword;
    }

    public addRole(role: UserRole): void {
        this.props.roles.push(role);
    }

    
}