"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaOTPRepository = void 0;
const otp_entity_1 = require("../../../domain/otp/otp.entity");
class PrismaOTPRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async save(otp) {
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
    async findByIdAndPurpose(userId, purpose) {
        const otpModel = await this.prisma.oTPVerification.findFirst({
            where: { user_id: userId, purpose: purpose },
            orderBy: { created_at: 'desc' }
        });
        if (!otpModel)
            return null;
        return this.toDomain(otpModel);
    }
    toDomain(model) {
        return otp_entity_1.OTP.create({
            user_id: model.user_id,
            otp: model.otp,
            purpose: model.purpose,
            channel: model.channel,
            expires_at: model.expires_at,
            attempts: model.attempts,
            status: model.status,
            created_at: model.created_at
        }, model.otp_id).getValue();
    }
}
exports.PrismaOTPRepository = PrismaOTPRepository;
