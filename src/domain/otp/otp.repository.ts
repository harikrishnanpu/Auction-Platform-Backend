import { OTP, OtpPurpose } from "./otp.entity";

export interface IOTPRepository {
    save(otp: OTP): Promise<void>;
    findLatestByUser(userId: string, purpose: OtpPurpose): Promise<OTP | null>;
    findByIdentifierAndPurpose(identifier: string, purpose: OtpPurpose): Promise<OTP | null>;
    findLatestByIdentifierAndPurpose(identifier: string, purpose: OtpPurpose): Promise<OTP | null>;
}
