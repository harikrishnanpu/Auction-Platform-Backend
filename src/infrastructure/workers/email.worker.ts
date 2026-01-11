import { Worker, Job } from 'bullmq';
import nodemailer from 'nodemailer';

interface EmailJobData {
    to: string;
    subject: string;
    body: string;
}

const MAIL_USER = process.env.MAIL_USER;
const MAIL_PASS = process.env.MAIL_PASS;

export class EmailWorker {
    private worker: Worker;
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: MAIL_USER,
                pass: MAIL_PASS
            }
        });

        this.worker = new Worker<EmailJobData>('email-queue', async (job: Job<EmailJobData>) => {
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

    private async processJob(job: Job<EmailJobData>): Promise<void> {
        const { to, subject, body } = job.data;

        try {
            await this.transporter.sendMail({
                from: `"Auction Platform" ${MAIL_USER}`,
                to,
                subject,
                html: body
            });
            console.log(`Email sent to ${to}`);
        } catch (error) {
            console.error(`Failed to send email to ${to}:`, error);
            throw error;
        }
    }
}
