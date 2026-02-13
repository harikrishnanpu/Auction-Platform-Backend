"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KycControllerFactory = void 0;
const kyc_controller_1 = require("../controllers/kyc/kyc.controller");
class KycControllerFactory {
    static create(generateUploadUrlUseCase, completeKycUploadUseCase, getKycStatusUseCase, submitKycUseCase) {
        return new kyc_controller_1.KycController(generateUploadUrlUseCase, completeKycUploadUseCase, getKycStatusUseCase, submitKycUseCase);
    }
}
exports.KycControllerFactory = KycControllerFactory;
