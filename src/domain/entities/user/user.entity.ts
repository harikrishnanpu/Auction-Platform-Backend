import { Email } from "@domain/value-objects/user/email.vo";
import { Password } from "@domain/value-objects/user/password.vo";
import { Phone } from "@domain/value-objects/user/phone.vo";
import { Result } from "@result/result";


export enum UserRole {
    USER = 'USER',
    SELLER = 'SELLER',
    MODERATOR = 'MODERATOR',
    ADMIN = "ADMIN"
}

export interface UserProps {
    name: string;
    email: Email;
    phone?: Phone;
    address: string;
    avatar_url?: string;
    password?: Password;
    googleId?: string;
    roles: UserRole[];
    is_blocked: boolean;
    is_verified: boolean;
    is_profile_completed?: boolean;
    created_at?: Date;
}


export class User {

    private constructor(
        private props: UserProps,
        public readonly id?: string
    ) { }

    public static create(props: UserProps, id?: string): Result<User> {

        if (props.roles.length === 0) {
            return Result.fail("User must have at least one role");
        }

        if (props.is_blocked && props.is_verified) {
            return Result.fail("User cannot be blocked and verified");
        }

        return Result.ok(new User(props, id));
    }

    get name() { return this.props.name; }
    get email() { return this.props.email; }
    get phone() { return this.props.phone; }
    get address() { return this.props.address; }
    get avatar_url() { return this.props.avatar_url; }
    get password() { return this.props.password; }
    get googleId() { return this.props.googleId; }
    get roles() { return this.props.roles; }
    get is_blocked() { return this.props.is_blocked; }
    get is_verified() { return this.props.is_verified; }
    get is_profile_completed() { return this.props.is_profile_completed ?? false; }
    get created_at() { return this.props.created_at ?? new Date(); }

    public verify(): void {
        this.props.is_verified = true;
    }

    public completeProfile(phone: Phone, address: string): void {
        this.props.phone = phone;
        this.props.address = address;
        this.props.is_profile_completed = true;
    }

    public changePassword(password: Password): void {
        this.props.password = password;
    }

    public update(props: { name?: string; address?: string; avatar_url?: string; phone?: Phone; email?: Email }): void {
        if (props.name) this.props.name = props.name;
        if (props.address) this.props.address = props.address;
        if (props.avatar_url) this.props.avatar_url = props.avatar_url;
        if (props.phone) this.props.phone = props.phone;
        if (props.email) this.props.email = props.email;
    }

    public block(): void {
        this.props.is_blocked = true;
    }

    public unblock(): void {
        this.props.is_blocked = false;
    }

    public addRole(role: UserRole): void {
        if (!this.props.roles.includes(role)) {
            this.props.roles.push(role);
        }
    }
}
