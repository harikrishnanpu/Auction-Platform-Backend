import { ILogger } from "@application/ports/logger.port";
import { Result } from "@result/result";
import { IUserRepository } from "@domain/repositories/user.repository";
import { User } from "@domain/entities/user/user.entity";
import { Phone } from "@domain/value-objects/user/phone.vo";
import { ICompleteProfileUseCase } from "@application/interfaces/use-cases/user.usecase.interface";

export class CompleteProfileUseCase implements ICompleteProfileUseCase {
    constructor(
        private readonly _userRepository: IUserRepository,
        private readonly _logger: ILogger,
    ) { }

    public async execute(request: { userId: string; phone: string; address: string }): Promise<Result<User>> {
        const { userId, phone, address } = request;
        const user = await this._userRepository.findById(userId);

        if (!user) {
            return Result.fail("User not found");
        }

        if (user.is_blocked) {
            return Result.fail("User is blocked");
        }

        const phoneResult = Phone.create(phone);
        if (phoneResult.isFailure) {
            return Result.fail(phoneResult.error!);
        }

        user.completeProfile(phoneResult.getValue(), address);

        await this._userRepository.save(user);
        return Result.ok(user);
    }
}
