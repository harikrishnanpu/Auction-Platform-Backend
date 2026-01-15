import { Request, Response } from 'express';
import { LoginAdminUseCase } from '../../application/useCases/admin/login-admin.usecase';
import { loginSchema } from '../validators/auth.validator';
import { LoginUserDto } from '../../application/dtos/auth/auth.dto';

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
                return res.status(400).json({ errors: (parseResult.error as any).errors });
            }

            const dto: LoginUserDto = parseResult.data;
            const result = await this.loginAdminUseCase.execute(dto);

            if (result.isSuccess) {
                const user = result.getValue();

                const { accessToken, refreshToken } = user;
                if (accessToken && refreshToken) {
                    this.setCookies(res, accessToken, refreshToken);
                }

                return res.status(200).json({
                    message: "Admin Login successful",
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
                return res.status(401).json({ message: result.error });
            }
        } catch (err) {
            console.log(err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }
}
