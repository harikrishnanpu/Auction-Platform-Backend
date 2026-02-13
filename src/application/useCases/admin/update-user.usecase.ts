import { IUserRepository } from "@domain/repositories/user.repository";
import { Result } from "@result/result";
import { IUpdateUserUseCase } from "@application/interfaces/use-cases/admin.usecase.interface";
import { UserResponseDto } from "@application/dtos/auth/auth.dto";
import { Email } from "@domain/value-objects/user/email.vo";

export class UpdateUserUseCase implements IUpdateUserUseCase {
    constructor(private userRepository: IUserRepository) { }

    public async execute(userId: string, dto: any): Promise<Result<UserResponseDto>> {
        const user = await this.userRepository.findById(userId);
        if (!user) return Result.fail("User not found");

        if (dto.name !== undefined) user.update({ name: dto.name });

        if (dto.email !== undefined) {
            const emailResult = Email.create(dto.email);
            if (emailResult.isFailure) return Result.fail(emailResult.error!);
            user.update({ email: emailResult.getValue() });
        }

        if (dto.phone !== undefined) {
            const { Phone } = await import("@domain/value-objects/user/phone.vo");
            const phoneResult = Phone.create(dto.phone);
            if (phoneResult.isFailure) return Result.fail(phoneResult.error!);
            user.update({ phone: phoneResult.getValue() });
        }

        if (dto.address !== undefined) user.update({ address: dto.address });
        if (dto.avatar_url !== undefined) user.update({ avatar_url: dto.avatar_url });

        await this.userRepository.save(user);

        return Result.ok<UserResponseDto>({
            id: user.id!,
            name: user.name,
            email: user.email.getValue(),
            roles: user.roles,
            is_blocked: user.is_blocked,
            is_verified: user.is_verified,
            created_at: user.created_at
        });
    }
}
