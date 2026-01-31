import { IKYCRepository, KYCProfile, KYCType } from "../../../domain/kyc/kyc.repository";
import prisma from "../../../utils/prismaClient";

export class PrismaKYCRepository implements IKYCRepository {
    async findByUserId(userId: string, type?: KYCType): Promise<KYCProfile | null> {
        const profile = await prisma.kYCProfile.findFirst({
            where: {
                user_id: userId,
                ...(type ? { kyc_type: type as any } : {})
            }
        });

        if (!profile) return null;

        return profile as unknown as KYCProfile;
    }

    async save(kyc: Partial<KYCProfile> & { user_id: string }): Promise<KYCProfile> {
        const profile = await prisma.kYCProfile.upsert({
            where: { kyc_id: kyc.kyc_id || '' },
            update: {
                ...kyc as any,
                updated_at: new Date()
            },
            create: {
                user_id: kyc.user_id,
                kyc_type: kyc.kyc_type as any || 'SELLER',
                document_type: kyc.document_type || '',
                document_number: kyc.document_number || '',
                verification_status: kyc.verification_status || 'PENDING',
                id_front_url: kyc.id_front_url,
                id_back_url: kyc.id_back_url,
                address_proof_url: kyc.address_proof_url,
                address: kyc.address
            }
        });

        return profile as unknown as KYCProfile;
    }

    async updateStatus(kycId: string, status: string): Promise<void> {
        await prisma.kYCProfile.update({
            where: { kyc_id: kycId },
            data: {
                verification_status: status,
                updated_at: new Date()
            }
        });
    }

    async countPending(): Promise<number> {
        return prisma.kYCProfile.count({
            where: { verification_status: 'PENDING' }
        });
    }
}
