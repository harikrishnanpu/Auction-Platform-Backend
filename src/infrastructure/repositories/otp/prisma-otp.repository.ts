import { PrismaClient } from "@prisma/client";
import { IOTPRepository } from "../../../domain/otp/otp.repository";
import { OTP, OtpChannel, OtpPurpose, OtpStatus } from "../../../domain/otp/otp.entity";

export class PrismaOTPRepository implements IOTPRepository {
    constructor(private prisma: PrismaClient) { }

    async save(otp: OTP): Promise<void> {
        const data = {
            otp_id: otp.id,
            user_id: otp.user_id,
            identifier: otp.identifier,
            otp_hash: otp.otp_hash,
            purpose: otp.purpose,
            channel: otp.channel,
            expires_at: otp.expires_at,
            attempts: otp.attempts,
            max_attempts: otp.max_attempts,
            status: otp.status,
            created_at: otp.created_at
        };

        await this.prisma.oTPVerification.upsert({
            where: { otp_id: otp.id },
            update: data,
            create: data
        });
    }

    async findLatestByUser(userId: string, purpose: OtpPurpose): Promise<OTP | null> {
        const otpModel = await this.prisma.oTPVerification.findFirst({
            where: { user_id: userId, purpose: purpose },
            orderBy: { created_at: 'desc' }
        });

        if (!otpModel) return null;
        return this.toDomain(otpModel);
    }

    async findByIdentifierAndPurpose(identifier: string, purpose: OtpPurpose): Promise<OTP | null> {
        const otpModel = await this.prisma.oTPVerification.findFirst({
            where: { identifier: identifier, purpose: purpose },
            orderBy: { created_at: 'desc' }
        });

        if (!otpModel) return null;
        return this.toDomain(otpModel);
    }

    private toDomain(model: any): OTP {
        return OTP.create({
            user_id: model.user_id,
            identifier: model.identifier,
            otp_hash: model.otp_hash,
            purpose: model.purpose as OtpPurpose,
            channel: model.channel as OtpChannel,
            expires_at: model.expires_at,
            attempts: model.attempts,
            max_attempts: model.max_attempts,
            status: model.status as OtpStatus,
            created_at: model.created_at
        }, model.otp_id).getValue();
    }
}
