import { IUserRepository } from "@domain/repositories/user.repository";
import { IOTPRepository } from "@domain/entities/otp/otp.repository";
import { Result } from "@result/result";
import { Password } from "@domain/value-objects/user/password.vo";
import { OtpPurpose, OtpStatus } from "@domain/entities/otp/otp.entity";
import { IPasswordHasher } from "@application/services/auth/auth.service";
import { IChangePasswordUseCase } from "@application/interfaces/use-cases/user.usecase.interface";

export interface ChangePasswordRequest {
    userId: string;
    newPassword: string;
    confirmPassword: string;
    otp: string;
    oldPassword?: string;
}

export class ChangePasswordUseCase implements IChangePasswordUseCase {
    constructor(
        private userRepository: IUserRepository,
        private otpRepository: IOTPRepository,
        private passwordHasher: IPasswordHasher
    ) { }

    public async execute(request: { userId: string; oldPassword?: string; newPassword: string; confirmPassword: string; otp: string }): Promise<Result<void>> {
        if (request.newPassword !== request.confirmPassword) {
            return Result.fail("Passwords do not match");
        }

        const user = await this.userRepository.findById(request.userId);
        if (!user) return Result.fail("User not found");

        const otpRecord = await this.otpRepository.findByIdAndPurpose(request.userId, OtpPurpose.RESET_PASSWORD);
        if (!otpRecord) return Result.fail("OTP not found or expired");
        if (otpRecord.isExpired()) return Result.fail("OTP expired");
        if (otpRecord.status !== OtpStatus.PENDING) return Result.fail("OTP already used or invalid");

        if (!otpRecord.verify(request.otp)) {
            otpRecord.incrementAttempts();
            await this.otpRepository.save(otpRecord);
            return Result.fail("Invalid OTP");
        }

        if (user.password) {
            if (!request.oldPassword) return Result.fail("Old password is required");
            const isValid = await this.passwordHasher.compare(request.oldPassword, user.password.getValue());
            if (!isValid) return Result.fail("Incorrect old password");
        }

        const hashedPassword = await this.passwordHasher.hash(request.newPassword);
        const passwordResult = Password.create(hashedPassword);
        if (passwordResult.isFailure) return Result.fail(passwordResult.error!);

        user.changePassword(passwordResult.getValue());
        otpRecord.markAsVerified();

        await this.otpRepository.save(otpRecord);
        await this.userRepository.save(user);

        return Result.ok<void>(undefined as any);
    }
}
