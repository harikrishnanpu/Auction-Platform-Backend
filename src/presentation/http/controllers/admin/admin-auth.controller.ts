import { Request, Response } from 'express';
import { ILoginAdminUseCase } from 'application/interfaces/use-cases/admin.usecase.interface';
import { loginSchema } from 'presentation/validators/auth.validator';
import { LoginUserDto } from 'application/dtos/auth/auth.dto';
import { STATUS_CODE } from 'constants/status.code';
import { AppError } from 'shared/app.error';
import expressAsyncHandler from 'express-async-handler';

export class AdminAuthController {
    constructor(
        private loginAdminUseCase: ILoginAdminUseCase
    ) { }

    private setCookies(res: Response, accessToken: string, refreshToken: string) {
        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000,
            path: '/'
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/'
        });
    }

    login = expressAsyncHandler(async (req: Request, res: Response) => {
        const parseResult = loginSchema.safeParse(req.body);
        if (!parseResult.success) {
            throw new AppError("Invalid input", STATUS_CODE.BAD_REQUEST);
        }

        const dto: LoginUserDto = parseResult.data;
        const result = await this.loginAdminUseCase.execute(dto);

        if (result.isFailure) {
            throw new AppError(result.error!, STATUS_CODE.UNAUTHORIZED);
        }

        const user = result.getValue();
        this.setCookies(res, user.accessToken, user.refreshToken);

        res.status(STATUS_CODE.SUCCESS).json({
            success: true,
            message: "Admin login successful",
            admin: user
        });
    });

    logout = expressAsyncHandler(async (req: Request, res: Response) => {
        res.clearCookie('accessToken', { path: '/' });
        res.clearCookie('refreshToken', { path: '/' });
        res.status(STATUS_CODE.SUCCESS).json({ success: true, message: "Logged out successfully" });
    });
}
