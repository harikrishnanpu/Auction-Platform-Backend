export interface IEmailService {
    sendOtpEmail(to: string, otp: string): Promise<void>;
    sendPasswordResetEmail(to: string, link: string): Promise<void>;
}
