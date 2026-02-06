import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../../shared/app.error';
import { STATUS_CODE } from '../../constants/status.code';

export const validateRequest = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessage = error.issues.map((issue) => issue.message).join(', ');
                return next(new AppError(errorMessage, STATUS_CODE.BAD_REQUEST));
            }
            next(error);
        }
    };
};
