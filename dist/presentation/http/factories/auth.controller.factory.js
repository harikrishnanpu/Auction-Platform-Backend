"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthControllerFactory = void 0;
const auth_controller_1 = require("../controllers/auth/auth.controller");
class AuthControllerFactory {
    static create(registerUserUseCase, loginUserUseCase, verifyEmailUseCase, resendOtpUseCase, refreshTokenUseCase, getProfileUseCase, completeProfileUseCase, updateProfileUseCase, updateAvatarUseCase, changePasswordUseCase, forgotPasswordUseCase, resetPasswordUseCase, loginGoogleUseCase, sendVerificationOtpUseCase) {
        return new auth_controller_1.AuthController(registerUserUseCase, loginUserUseCase, verifyEmailUseCase, resendOtpUseCase, refreshTokenUseCase, getProfileUseCase, completeProfileUseCase, updateProfileUseCase, updateAvatarUseCase, changePasswordUseCase, forgotPasswordUseCase, resetPasswordUseCase, loginGoogleUseCase, sendVerificationOtpUseCase);
    }
}
exports.AuthControllerFactory = AuthControllerFactory;
