import { IUserRepository } from "@domain/repositories/user.repository";
import { Result } from "@result/result";
import { IDeleteUserUseCase } from "@application/interfaces/use-cases/admin.usecase.interface";

export class DeleteUserUseCase implements IDeleteUserUseCase {
    constructor(private userRepository: IUserRepository) { }

    public async execute(userId: string): Promise<Result<void>> {
        try {
            const user = await this.userRepository.findById(userId);
            if (!user) return Result.fail("User not found");

            await this.userRepository.delete(userId);

            return Result.ok<void>(undefined);
        } catch (error) {
            return Result.fail((error as Error).message);
        }
    }
}
