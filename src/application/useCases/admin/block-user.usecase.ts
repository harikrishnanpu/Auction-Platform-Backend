import { IUserRepository } from "@domain/repositories/user.repository";
import { Result } from "@result/result";
import { IBlockUserUseCase } from "@application/interfaces/use-cases/admin.usecase.interface";

export class BlockUserUseCase implements IBlockUserUseCase {
    constructor(private userRepository: IUserRepository) { }

    public async execute(userId: string, block: boolean): Promise<Result<void>> {
        const user = await this.userRepository.findById(userId);
        if (!user) return Result.fail("User not found");

        if (block) {
            user.block();
        } else {
            user.unblock();
        }

        await this.userRepository.save(user);
        return Result.ok<void>(undefined);
    }
}
