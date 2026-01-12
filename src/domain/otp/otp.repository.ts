import { OTP, OtpPurpose } from "./otp.entity";

export interface IOTPRepository {
    save(otp: OTP): Promise<void>;
    findLatestByUser(userId: string, purpose: OtpPurpose): Promise<OTP | null>;
    findByIdAndPurpose(identifier: string, purpose: OtpPurpose): Promise<OTP | null>;
    findLatestByIdAndPurpose(identifier: string, purpose: OtpPurpose): Promise<OTP | null>;
}
