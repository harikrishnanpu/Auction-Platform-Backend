"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailWorker = void 0;
const bullmq_1 = require("bullmq");
const nodemailer_1 = __importDefault(require("nodemailer"));
const MAIL_USER = process.env.MAIL_USER;
const MAIL_PASS = process.env.MAIL_PASS;
class EmailWorker {
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            service: 'Gmail',
            auth: {
                user: MAIL_USER,
                pass: MAIL_PASS
            }
        });
        this.worker = new bullmq_1.Worker('email-queue', async (job) => {
            console.log(`Processing email job ${job.id} for ${job.data.to}`);
            await this.processJob(job);
        }, {
            connection: {
                host: process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT || '6379')
            }
        });
        this.worker.on('completed', (job) => {
            console.log(`Email job ${job.id} completed`);
        });
        this.worker.on('failed', (job, err) => {
            console.error(`Email job ${job?.id} failed: ${err.message}`);
        });
    }
    async processJob(job) {
        const { to, subject, body } = job.data;
        try {
            await this.transporter.sendMail({
                from: `"Auction Platform" ${MAIL_USER}`,
                to,
                subject,
                html: body
            });
            console.log(`Email sent to ${to}`);
        }
        catch (error) {
            console.error(`Failed to send email to ${to}:`, error);
            throw error;
        }
    }
}
exports.EmailWorker = EmailWorker;
