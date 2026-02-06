import { Entity } from "../shared/entity";
import { Result } from "../shared/result";

export enum OtpPurpose {
    REGISTER = 'REGISTER',
    LOGIN = 'LOGIN',
    VERIFY_PHONE = 'VERIFY_PHONE',
    VERIFY_EMAIL = 'VERIFY_EMAIL',
    RESET_PASSWORD = 'RESET_PASSWORD'
}

export enum OtpChannel {
    SMS = 'SMS',
    EMAIL = 'EMAIL'
}

export enum OtpStatus {
    PENDING = 'PENDING',
    VERIFIED = 'VERIFIED',
    EXPIRED = 'EXPIRED',
    BLOCKED = 'BLOCKED'
}

interface OtpProps {
    user_id: string;
    otp: string;
    purpose: OtpPurpose;
    channel: OtpChannel;
    expires_at: Date;
    attempts: number;
    status: OtpStatus;
    created_at: Date;
}

export class OTP extends Entity<OtpProps> {
    get user_id(): string { return this.props.user_id; }
    get otp(): string { return this.props.otp; }
    get purpose(): OtpPurpose { return this.props.purpose; }
    get channel(): OtpChannel { return this.props.channel; }
    get expires_at(): Date { return this.props.expires_at; }
    get attempts(): number { return this.props.attempts; }
    get status(): OtpStatus { return this.props.status; }
    get created_at(): Date { return this.props.created_at; }

    private constructor(props: OtpProps, id?: string) {
        super(props, id);
    }

    public static create(
        props: {
            user_id: string;
            otp: string;
            purpose: OtpPurpose;
            channel: OtpChannel;
            expires_at: Date;
            attempts?: number;
            status?: OtpStatus;
            created_at?: Date;
        },
        id?: string
    ): Result<OTP> {
        return Result.ok<OTP>(new OTP({
            ...props,
            attempts: props.attempts ?? 0,
            status: props.status ?? OtpStatus.PENDING,
            created_at: props.created_at ?? new Date(),
        }, id));
    }

    public isExpired(): boolean {
        return new Date() > this.props.expires_at;
    }

    public incrementAttempts(): void {
        this.props.attempts++;
    }

    public verify(otp: string): boolean {
        return this.props.otp === otp;
    }

    public markAsVerified(): void {
        this.props.status = OtpStatus.VERIFIED;
    }

    public markAsExpired(): void {
        this.props.status = OtpStatus.EXPIRED;
    }
}
