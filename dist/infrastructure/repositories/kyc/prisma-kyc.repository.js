"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaKYCRepository = void 0;
const prismaClient_1 = __importDefault(require("../../../utils/prismaClient"));
class PrismaKYCRepository {
    async findByUserId(userId, type) {
        const profile = await prismaClient_1.default.kYCProfile.findFirst({
            where: {
                user_id: userId,
                ...(type ? { kyc_type: type } : {})
            }
        });
        if (!profile)
            return null;
        return profile;
    }
    async save(kyc) {
        const profile = await prismaClient_1.default.kYCProfile.upsert({
            where: { kyc_id: kyc.kyc_id || '' },
            update: {
                ...kyc,
                updated_at: new Date()
            },
            create: {
                user_id: kyc.user_id,
                kyc_type: kyc.kyc_type || 'SELLER',
                document_type: kyc.document_type || '',
                document_number: kyc.document_number || '',
                verification_status: kyc.verification_status || 'PENDING',
                rejection_reason_type: kyc.rejection_reason_type || null,
                rejection_reason_message: kyc.rejection_reason_message || null,
                rejected_at: kyc.rejected_at || null,
                id_front_url: kyc.id_front_url,
                id_back_url: kyc.id_back_url,
                address_proof_url: kyc.address_proof_url,
                address: kyc.address
            }
        });
        return profile;
    }
    async updateStatus(kycId, status, reasonType, reasonMessage, rejectedAt) {
        await prismaClient_1.default.kYCProfile.update({
            where: { kyc_id: kycId },
            data: {
                verification_status: status,
                rejection_reason_type: reasonType ?? null,
                rejection_reason_message: reasonMessage ?? null,
                rejected_at: rejectedAt ?? null,
                updated_at: new Date()
            }
        });
    }
    async countPending() {
        return prismaClient_1.default.kYCProfile.count({
            where: { verification_status: 'PENDING' }
        });
    }
}
exports.PrismaKYCRepository = PrismaKYCRepository;
