import { IUserRepository } from "../../../domain/user/user.repository";
import { Result } from "../../../domain/shared/result";

export class DeleteUserUseCase {
    constructor(private userRepository: IUserRepository) { }

    public async execute(userId: string): Promise<Result<void>> {
        const user = await this.userRepository.findById(userId);
        if (!user) return Result.fail("User not found");

        await this.userRepository.delete(userId);

        return Result.ok<void>(undefined);
    }
}
