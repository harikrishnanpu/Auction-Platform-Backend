import { ILogger } from "@application/ports/logger.port";
import { Result } from "@domain/shared/result";
import { IUserRepository } from "@domain/user/user.repository";
import { User } from "@prisma/client";


export class CompleteProfileUseCase {
    constructor(
        private readonly _userRepository: IUserRepository,
        private readonly _logger: ILogger,
    ) { }


    public async execute(userId: string, phone: string, address: string): Promise<Result<User>> {

        const user = await this._userRepository.findById(userId);


        if (!user) {
            return Result.fail("User not found");
        }

        if (user.is_blocked) {
            return Result.fail("User is blocked");
        }


        const updatedUser = await this._userRepository.update(userId, { phone, address });
        return Result.ok(updatedUser);


    }




}