import { IUserRepository } from "@domain/repositories/user.repository";
import { Result } from "@result/result";
import { UserRole } from "@domain/entities/user/user.entity";
import { IAssignSellerRoleUseCase } from "@application/interfaces/use-cases/admin.usecase.interface";

export class AssignSellerRoleUseCase implements IAssignSellerRoleUseCase {
    constructor(private userRepository: IUserRepository) { }

    public async execute(userId: string): Promise<Result<void>> {
        try {
            const user = await this.userRepository.findById(userId);
            if (!user) return Result.fail("User not found");

            if (!user.roles.includes(UserRole.SELLER)) {
                user.addRole(UserRole.SELLER);
                await this.userRepository.save(user);
            }

            return Result.ok<void>(undefined);
        } catch (error) {
            return Result.fail((error as Error).message);
        }
    }
}
