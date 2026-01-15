import { IOtpService } from "@application/ports/otp.port";



export class OtpService implements IOtpService { 

    generateOtp(): string {
        const min = 100000;
        const max = 999999;
        return Math.floor(Math.random() * (max - min + 1) + min).toString();
    }

    isOtpValid(otp: string): boolean {
        return otp.length === 6;
    }

}