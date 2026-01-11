import { IUserRepository } from "../../../domain/user/user.repository";
import { Result } from "../../../domain/shared/result";
import { UserId } from "../../../domain/user/user-id.vo";
import prisma from "../../../utils/prismaClient";

export class DeleteUserUseCase {
    constructor(private userRepository: IUserRepository) { }

    public async execute(userId: string): Promise<Result<void>> {
        const userIdOrError = UserId.create(userId);
        if (userIdOrError.isFailure) return Result.fail("Invalid User ID");

        const user = await this.userRepository.findById(userIdOrError.getValue());
        if (!user) return Result.fail("User not found");

        // Delete user (cascade will handle related records)
        await prisma.user.delete({
            where: { user_id: userIdOrError.getValue().value }
        });

        return Result.ok<void>(undefined);
    }
}
