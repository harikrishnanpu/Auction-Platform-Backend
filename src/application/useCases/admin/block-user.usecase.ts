import { IUserRepository } from "../../../domain/user/user.repository";
import { Result } from "../../../domain/shared/result";

export class BlockUserUseCase {
    constructor(private userRepository: IUserRepository) { }

    public async execute(userId: string, block: boolean): Promise<Result<void>> {
        const user = await this.userRepository.findById(userId);
        if (!user) return Result.fail("User not found");

        (user as any).props.is_blocked = block;
        await this.userRepository.save(user);
        return Result.ok<void>(undefined);
    }
}
