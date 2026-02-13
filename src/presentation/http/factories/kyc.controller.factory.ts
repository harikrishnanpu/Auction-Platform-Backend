import {
    IGenerateUploadUrlUseCase,
    ICompleteKycUploadUseCase,
    IGetKycStatusUseCase,
    ISubmitKycUseCase
} from "application/interfaces/use-cases/kyc.usecase.interface";
import { KycController } from "../controllers/kyc/kyc.controller";

export class KycControllerFactory {
    static create(
        generateUploadUrlUseCase: IGenerateUploadUrlUseCase,
        completeKycUploadUseCase: ICompleteKycUploadUseCase,
        getKycStatusUseCase: IGetKycStatusUseCase,
        submitKycUseCase: ISubmitKycUseCase
    ): KycController {
        return new KycController(
            generateUploadUrlUseCase,
            completeKycUploadUseCase,
            getKycStatusUseCase,
            submitKycUseCase
        );
    }
}
