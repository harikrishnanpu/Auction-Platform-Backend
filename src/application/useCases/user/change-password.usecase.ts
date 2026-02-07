import { IUserRepository } from "../../../domain/user/user.repository";
import { IOTPRepository } from "../../../domain/otp/otp.repository";
import { Result } from "../../../domain/shared/result";
import { Password } from "../../../domain/user/password.vo";
import { OtpPurpose, OtpStatus } from "../../../domain/otp/otp.entity";
import { IPasswordHasher } from "../../services/auth/auth.service";

export interface ChangePasswordDto {
    userId: string;
    newPassword: string;
    confirmPassword: string;
    otp: string;
    oldPassword?: string;
}

export class ChangePasswordUseCase {
    constructor(
        private userRepository: IUserRepository,
        private otpRepository: IOTPRepository,
        private passwordHasher: IPasswordHasher
    ) { }

    public async execute(dto: ChangePasswordDto): Promise<Result<void>> {
        if (dto.newPassword !== dto.confirmPassword) {
            return Result.fail("Passwords do not match");
        }

        const user = await this.userRepository.findById(dto.userId);
        if (!user) return Result.fail("User not found");

        // Verify OTP
        const otpRecord = await this.otpRepository.findByIdAndPurpose(dto.userId, OtpPurpose.RESET_PASSWORD);
        if (!otpRecord) {
            return Result.fail("OTP not found or expired");
        }

        if (otpRecord.isExpired()) {
            return Result.fail("OTP expired");
        }

        if (otpRecord.status !== OtpStatus.PENDING) {
            return Result.fail("OTP already used or invalid");
        }

        if (!otpRecord.verify(dto.otp)) {
            otpRecord.incrementAttempts();
            await this.otpRepository.save(otpRecord);
            return Result.fail("Invalid OTP");
        }

        // If user has existing password, verify old password
        if (user.password) {
            if (!dto.oldPassword) {
                return Result.fail("Old password is required");
            }
            const isValid = await this.passwordHasher.compare(dto.oldPassword, user.password.value);
            if (!isValid) {
                return Result.fail("Incorrect old password");
            }
        }

        const validation = Password.validate(dto.newPassword);
        if (validation.isFailure) {
            return Result.fail(validation.error as string);
        }

        const hashedPassword = await this.passwordHasher.hash(dto.newPassword);
        const passwordOrError = Password.create(hashedPassword);

        if (passwordOrError.isFailure) {
            return Result.fail(passwordOrError.error as string);
        }

        user.changePassword(passwordOrError.getValue());

        // Mark OTP as verified
        otpRecord.markAsVerified();
        await this.otpRepository.save(otpRecord);

        await this.userRepository.save(user);

        return Result.ok<void>();
    }
}
