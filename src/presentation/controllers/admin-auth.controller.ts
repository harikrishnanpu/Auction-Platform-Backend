import { Request, Response } from 'express';
import { LoginAdminUseCase } from '../../application/useCases/admin/login-admin.usecase';
import { loginSchema } from '../validators/auth.validator';
import { LoginUserDto } from '../../application/dtos/auth/auth.dto';
import { HttpStatus } from '../../application/constants/http-status.constants';
import { ResponseMessages } from '../../application/constants/response.messages';

export class AdminAuthController {
    constructor(
        private loginAdminUseCase: LoginAdminUseCase
    ) { }

    private setCookies(res: Response, accessToken: string, refreshToken: string) {
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
    }

    login = async (req: Request, res: Response): Promise<any> => {
        try {
            const parseResult = loginSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(HttpStatus.BAD_REQUEST).json({ errors: (parseResult.error as any).errors });
            }

            const dto: LoginUserDto = parseResult.data;
            const result = await this.loginAdminUseCase.execute(dto);

            if (result.isSuccess) {
                const user = result.getValue();

                const { accessToken, refreshToken } = user;
                if (accessToken && refreshToken) {
                    this.setCookies(res, accessToken, refreshToken);
                }

                return res.status(HttpStatus.OK).json({
                    message: ResponseMessages.ADMIN_LOGIN_SUCCESS,
                    admin: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        roles: user.roles,
                        accessToken: user.accessToken,
                        refreshToken: user.refreshToken
                    }
                });
            } else {
                return res.status(HttpStatus.UNAUTHORIZED).json({ message: result.error });
            }
        } catch (err) {
            console.log(err);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: ResponseMessages.INTERNAL_SERVER_ERROR });
        }
    }
}

