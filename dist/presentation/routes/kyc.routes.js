"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KycRoutes = void 0;
const express_1 = require("express");
const authenticate_middleware_1 = require("../middlewares/authenticate.middleware");
class KycRoutes {
    constructor(kycController) {
        this.kycController = kycController;
        this._router = (0, express_1.Router)();
    }
    register() {
        this._router.post("/upload-url", authenticate_middleware_1.authenticate, this.kycController.generateUploadUrl);
        this._router.post("/complete-upload", authenticate_middleware_1.authenticate, this.kycController.completeUpload);
        this._router.get("/status", authenticate_middleware_1.authenticate, this.kycController.getStatus);
        this._router.post("/submit", authenticate_middleware_1.authenticate, this.kycController.submitKyc);
        return this._router;
    }
}
exports.KycRoutes = KycRoutes;
