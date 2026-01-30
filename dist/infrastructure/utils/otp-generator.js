"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpService = void 0;
class OtpService {
    generateOtp() {
        const min = 100000;
        const max = 999999;
        return Math.floor(Math.random() * (max - min + 1) + min).toString();
    }
    isOtpValid(otp) {
        return otp.length === 6;
    }
}
exports.OtpService = OtpService;
