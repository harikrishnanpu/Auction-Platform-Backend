import { OTP, OtpPurpose } from "./otp.entity";

export interface IOTPRepository {
    save(otp: OTP): Promise<void>;
    findByIdAndPurpose(userId: string, purpose: OtpPurpose): Promise<OTP | null>;
}
