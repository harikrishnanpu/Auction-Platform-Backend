import { IUserRepository } from "@domain/repositories/user.repository";
import { UserResponseDto } from "@application/dtos/auth/auth.dto";
import { Result } from "@result/result";
import { Phone } from "@domain/value-objects/user/phone.vo";
import { IUpdateProfileUseCase } from "@application/interfaces/use-cases/user.usecase.interface";

export class UpdateProfileUseCase implements IUpdateProfileUseCase {
    constructor(private userRepository: IUserRepository) { }

    public async execute(request: { userId: string; name?: string; address?: string; phone?: string; avatar_url?: string }): Promise<Result<UserResponseDto>> {
        const user = await this.userRepository.findById(request.userId);
        if (!user) return Result.fail("User not found");

        let phone: Phone | undefined;
        if (request.phone) {
            const phoneResult = Phone.create(request.phone);
            if (phoneResult.isFailure) return Result.fail(phoneResult.error!);
            phone = phoneResult.getValue();
        }

        user.update({
            name: request.name,
            address: request.address,
            avatar_url: request.avatar_url,
            phone: phone
        });

        await this.userRepository.save(user);

        return Result.ok<UserResponseDto>({
            id: user.id!,
            name: user.name,
            email: user.email.getValue(),
            roles: user.roles,
            is_verified: user.is_verified,
            is_profile_completed: user.is_profile_completed,
            phone: user.phone?.getValue(),
            address: user.address,
            avatar_url: user.avatar_url,
            created_at: user.created_at,
            has_password: !!user.password,
            is_google_user: !!user.googleId
        });
    }
}
