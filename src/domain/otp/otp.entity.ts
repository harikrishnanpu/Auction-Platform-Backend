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
    identifier: string; // email or phone
    otp_hash: string;
    purpose: OtpPurpose;
    channel: OtpChannel;
    expires_at: Date;
    attempts: number;
    max_attempts: number;
    status: OtpStatus;
    created_at: Date;
}

export class OTP extends Entity<OtpProps> {
    get user_id(): string { return this.props.user_id; }
    get identifier(): string { return this.props.identifier; }
    get otp_hash(): string { return this.props.otp_hash; }
    get purpose(): OtpPurpose { return this.props.purpose; }
    get channel(): OtpChannel { return this.props.channel; }
    get expires_at(): Date { return this.props.expires_at; }
    get attempts(): number { return this.props.attempts; }
    get max_attempts(): number { return this.props.max_attempts; }
    get status(): OtpStatus { return this.props.status; }
    get created_at(): Date { return this.props.created_at; }

    private constructor(props: OtpProps, id?: string) {
        super(props, id);
    }

    public static create(
        props: {
            user_id: string;
            identifier: string;
            otp_hash: string;
            purpose: OtpPurpose;
            channel: OtpChannel;
            expires_at: Date;
            attempts?: number;
            max_attempts?: number;
            status?: OtpStatus;
            created_at?: Date;
        },
        id?: string
    ): Result<OTP> {
        return Result.ok<OTP>(new OTP({
            ...props,
            attempts: props.attempts ?? 0,
            max_attempts: props.max_attempts ?? 3,
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

    public isMaxAttemptsReached(): boolean {
        return this.props.attempts >= this.props.max_attempts;
    }

    public verify(otpHash: string): boolean {
        // Ideally hash comparison happens in service, but if we pass hashed value here
        // Here we just check if it matches storage
        // Actually, logic usually is: service hashes input OTP -> compares with stored otp_hash
        // So this method might be redundant if we just compare strings, but let's keep check
        return this.props.otp_hash === otpHash;
    }

    public markAsVerified(): void {
        this.props.status = OtpStatus.VERIFIED;
    }

    public markAsExpired(): void {
        this.props.status = OtpStatus.EXPIRED;
    }
}
