"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const zod_1 = require("zod");
const app_error_1 = require("../../shared/app.error");
const status_code_1 = require("../../constants/status.code");
const validateRequest = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errorMessage = error.issues.map((issue) => issue.message).join(', ');
                return next(new app_error_1.AppError(errorMessage, status_code_1.STATUS_CODE.BAD_REQUEST));
            }
            next(error);
        }
    };
};
exports.validateRequest = validateRequest;
