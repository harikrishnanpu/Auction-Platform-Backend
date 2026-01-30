"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodemailerEmailService = void 0;
const bullmq_1 = require("bullmq");
class NodemailerEmailService {
    constructor() {
        this.emailQueue = new bullmq_1.Queue('email-queue', {
            connection: {
                host: process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT || '6379')
            }
        });
    }
    async sendOtpEmail(to, otp) {
        const subject = "Your Verification Code";
        const body = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #333;">Welcome to Auction Platform!</h1>
                <p style="font-size: 16px; color: #666;">Please use the following code to verify your email address:</p>
                <div style="background-color: #f4f4f4; padding: 24px; border-radius: 8px; text-align: center; margin: 24px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #000;">${otp}</span>
                </div>
                <p style="font-size: 14px; color: #999;">This code will expire in 10 minutes.</p>
            </div>
        `;
        await this.emailQueue.add('send-email', {
            to,
            subject,
            body
        });
        console.log(`Job added to queue for ${to}`);
    }
    async sendPasswordResetEmail(to, link) {
        const subject = "Reset Your Password";
        const body = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #333;">Reset Password Request</h1>
                <p style="font-size: 16px; color: #666;">You requested to reset your password. Click the button below to proceed:</p>
                <div style="background-color: #f4f4f4; padding: 24px; border-radius: 8px; text-align: center; margin: 24px 0;">
                    <a href="${link}" style="display: inline-block; padding: 14px 28px; font-size: 16px; color: #fff; background-color: #000; border-radius: 4px; text-decoration: none; font-weight: bold;">Reset Password</a>
                </div>
                <p style="font-size: 14px; color: #999;">Or copy and paste this link:</p>
                <p style="font-size: 12px; color: #555; word-break: break-all;">${link}</p>
                <p style="font-size: 14px; color: #999; margin-top: 20px;">This link will expire in 15 minutes.</p>
            </div>
        `;
        await this.emailQueue.add('send-email', {
            to,
            subject,
            body
        });
        console.log(`Reset Password job added to queue for ${to}`);
    }
}
exports.NodemailerEmailService = NodemailerEmailService;
