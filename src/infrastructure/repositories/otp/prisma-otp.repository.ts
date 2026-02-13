import { PrismaClient } from "@prisma/client";
import { IOTPRepository } from "../../../domain/entities/otp/otp.repository";
import { OTP, OtpChannel, OtpPurpose, OtpStatus } from "../../../domain/entities/otp/otp.entity";

export class PrismaOTPRepository implements IOTPRepository {
    constructor(private prisma: PrismaClient) { }

    async save(otp: OTP): Promise<void> {
        const data = {
            otp_id: otp.id,
            user_id: otp.user_id,
            otp: otp.otp,
            purpose: otp.purpose,
            channel: otp.channel,
            expires_at: otp.expires_at,
            attempts: otp.attempts,
            status: otp.status,
            created_at: otp.created_at
        };

        await this.prisma.oTPVerification.upsert({
            where: { otp_id: otp.id },
            update: data,
            create: data
        });
    }


    async findByIdAndPurpose(userId: string, purpose: OtpPurpose): Promise<OTP | null> {

        const otpModel = await this.prisma.oTPVerification.findFirst({
            where: { user_id: userId, purpose: purpose },
            orderBy: { created_at: 'desc' }
        });

        if (!otpModel) return null;
        return this.toDomain(otpModel);
    }


    private toDomain(model: any): OTP {
        return OTP.create({
            user_id: model.user_id,
            otp: model.otp,
            purpose: model.purpose as OtpPurpose,
            channel: model.channel as OtpChannel,
            expires_at: model.expires_at,
            attempts: model.attempts,
            status: model.status as OtpStatus,
            created_at: model.created_at
        }, model.otp_id).getValue();
    }
}
