import nodemailer from 'nodemailer';
import { IEmailService } from '../../../domain/services/email/email.service';

export class NodemailerEmailService implements IEmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        // Create a transporter using Ethereal for testing
        // In production, use real SMTP credentials from env
        this.transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: 'shayne.runte@ethereal.email', // Replace with dynamic test account creation if needed
                pass: 'testpass'
            }
        });

        // Better implementation: Create test account on fly if no env vars
        nodemailer.createTestAccount().then((account) => {
            this.transporter = nodemailer.createTransport({
                host: account.smtp.host,
                port: account.smtp.port,
                secure: account.smtp.secure,
                auth: {
                    user: account.user,
                    pass: account.pass,
                },
            });
            console.log("Email Service Initialized with Ethereal Account:", account.user);
        }).catch(err => console.error("Failed to create test email account", err));
    }

    async sendOtpEmail(to: string, otp: string): Promise<void> {
        const info = await this.transporter.sendMail({
            from: '"Auction Platform" <noreply@auctionplatform.com>',
            to: to,
            subject: "Your Verification Code",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #333;">Welcome to Auction Platform!</h1>
                    <p style="font-size: 16px; color: #666;">Please use the following code to verify your email address:</p>
                    <div style="background-color: #f4f4f4; padding: 24px; border-radius: 8px; text-align: center; margin: 24px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #000;">${otp}</span>
                    </div>
                    <p style="font-size: 14px; color: #999;">This code will expire in 10 minutes.</p>
                </div>
            `,
        });

        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
}
