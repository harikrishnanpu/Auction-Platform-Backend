import { IUserRepository } from "../../../domain/user/user.repository";
import { Result } from "../../../domain/shared/result";
import { UserId } from "../../../domain/user/user-id.vo";
import { UserRole } from "../../../domain/user/user.entity";
import prisma from "../../../utils/prismaClient";

export class VerifySellerKycUseCase {
    constructor(private userRepository: IUserRepository) { }

    public async execute(userId: string, verify: boolean): Promise<Result<void>> {
        const userIdOrError = UserId.create(userId);
        if (userIdOrError.isFailure) return Result.fail("Invalid User ID");

        const user = await this.userRepository.findById(userIdOrError.getValue());
        if (!user) return Result.fail("User not found");

        // Update KYC status
        const kycProfile = await prisma.kYCProfile.findFirst({
            where: { user_id: userId }
        });

        if (!kycProfile) {
            return Result.fail("KYC profile not found");
        }

        await prisma.kYCProfile.update({
            where: { kyc_id: kycProfile.kyc_id },
            data: {
                verification_status: verify ? 'VERIFIED' : 'REJECTED'
            }
        });

        // If verifying, ensure user has SELLER role
        if (verify && !user.roles.includes(UserRole.SELLER)) {
            user.addRole(UserRole.SELLER);
            await this.userRepository.save(user);
        }

        return Result.ok<void>(undefined);
    }
}
