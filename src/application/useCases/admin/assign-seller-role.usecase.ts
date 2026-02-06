import { IUserRepository } from "../../../domain/user/user.repository";
import { Result } from "../../../domain/shared/result";
import { UserRole } from "../../../domain/user/user.entity";

export class AssignSellerRoleUseCase {
    constructor(private userRepository: IUserRepository) { }

    public async execute(userId: string): Promise<Result<void>> {
        const user = await this.userRepository.findById(userId);
        if (!user) return Result.fail("User not found");

        if (!user.roles.includes(UserRole.SELLER)) {
            user.addRole(UserRole.SELLER);
            await this.userRepository.save(user);
        }

        return Result.ok<void>(undefined);
    }
}
