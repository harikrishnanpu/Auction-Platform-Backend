import { IUserRepository } from "../../../domain/user/user.repository";
import { Result } from "../../../domain/shared/result";
import { UserId } from "../../../domain/user/user-id.vo";
import { UserRole } from "../../../domain/user/user.entity";

export class AssignSellerRoleUseCase {
    constructor(private userRepository: IUserRepository) { }

    public async execute(userId: string): Promise<Result<void>> {
        const userIdOrError = UserId.create(userId);
        if (userIdOrError.isFailure) return Result.fail("Invalid User ID");

        const user = await this.userRepository.findById(userIdOrError.getValue());
        if (!user) return Result.fail("User not found");

        if (!user.roles.includes(UserRole.SELLER)) {
            user.addRole(UserRole.SELLER);
            await this.userRepository.save(user);
        }

        return Result.ok<void>(undefined);
    }
}
