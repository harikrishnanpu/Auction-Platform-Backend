import { IUserRepository } from "../../../domain/user/user.repository";
import { Result } from "../../../domain/shared/result";
import { UserId } from "../../../domain/user/user-id.vo";

export class BlockUserUseCase {
    constructor(private userRepository: IUserRepository) { }

    public async execute(userId: string, block: boolean): Promise<Result<void>> {
        const userIdOrError = UserId.create(userId);
        if (userIdOrError.isFailure) return Result.fail("Invalid User ID");

        const user = await this.userRepository.findById(userIdOrError.getValue());
        if (!user) return Result.fail("User not found");

        (user as any).props.is_blocked = block;
        await this.userRepository.save(user);
        return Result.ok<void>(undefined);
    }
}
