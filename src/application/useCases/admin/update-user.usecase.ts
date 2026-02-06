import { IUserRepository } from "../../../domain/user/user.repository";
import { Result } from "../../../domain/shared/result";

export interface UpdateUserDto {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    avatar_url?: string;
}

export class UpdateUserUseCase {
    constructor(private userRepository: IUserRepository) { }

    public async execute(userId: string, dto: UpdateUserDto): Promise<Result<void>> {
        const user = await this.userRepository.findById(userId);
        if (!user) return Result.fail("User not found");

        // Update fields
        if (dto.name !== undefined) {
            (user as any).props.name = dto.name;
        }
        if (dto.email !== undefined) {
            const { Email } = await import("../../../domain/user/email.vo");
            const emailResult = Email.create(dto.email);
            if (emailResult.isFailure) return Result.fail(emailResult.error as string);
            (user as any).props.email = emailResult.getValue();
        }
        if (dto.phone !== undefined) {
            (user as any).props.phone = dto.phone;
        }
        if (dto.address !== undefined) {
            (user as any).props.address = dto.address;
        }
        if (dto.avatar_url !== undefined) {
            (user as any).props.avatar_url = dto.avatar_url;
        }

        await this.userRepository.save(user);
        return Result.ok<void>(undefined);
    }
}
