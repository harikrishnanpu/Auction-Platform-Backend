import { IUserRepository } from "../../../domain/user/user.repository";
import { UserResponseDto } from "../../dtos/auth/auth.dto";
import { Result } from "../../../domain/shared/result";
import { Phone } from "../../../domain/user/phone.vo";

export interface UpdateProfileDto {
    userId: string;
    name?: string;
    phone?: string;
    address?: string;
    avatar_url?: string;
}

export class UpdateProfileUseCase {
    constructor(private userRepository: IUserRepository) { }

    public async execute(dto: UpdateProfileDto): Promise<Result<UserResponseDto>> {
        const user = await this.userRepository.findById(dto.userId);

        if (!user) {
            return Result.fail("User not found");
        }

        if (dto.name) {
            // Assuming direct property update or add setter in Entity if strict DDD
            (user as any).props.name = dto.name;
        }

        if (dto.address) {
            (user as any).props.address = dto.address;
        }

        if (dto.avatar_url) {
            (user as any).props.avatar_url = dto.avatar_url;
        }

        if (dto.phone && dto.phone !== user.phone) {
            const phoneOrError = Phone.create(dto.phone);
            if (phoneOrError.isFailure) {
                return Result.fail(phoneOrError.error as string);
            }
            (user as any).props.phone = phoneOrError.getValue().value;
            // Maybe reset verification status if phone changed? 
            // For now, adhering to user request for simple edit.
        }

        await this.userRepository.save(user);

        return Result.ok<UserResponseDto>({
            id: user.id.toString(),
            name: user.name,
            email: user.email.value,
            roles: user.roles,
            is_verified: user.is_verified,
            is_profile_completed: user.is_profile_completed,
            phone: user.phone,
            address: user.address,
            avatar_url: user.avatar_url,
            created_at: user.created_at,
            has_password: !!user.password,
            is_google_user: !!user.googleId
        });
    }
}
