



export interface IOtpService {
    generateOtp(): string;
    isOtpValid(otp: string): boolean;
}