import { Request, Response } from 'express';
import { LoginUserUseCase } from '../../application/useCases/auth/login-user.usecase';
import { loginSchema } from '../validators/auth.validator';
import { LoginUserDto } from '../../application/dtos/auth/auth.dto';

export class AdminAuthController {
    constructor(
        private loginUserUseCase: LoginUserUseCase
    ) { }

    private setCookies(res: Response, accessToken: string, refreshToken: string) {
        res.cookie('adminAccessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        res.cookie('adminRefreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
    }

    login = async (req: Request, res: Response): Promise<any> => {
        try {
            const parseResult = loginSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ errors: (parseResult.error as any).errors });
            }

            const dto: LoginUserDto = parseResult.data;
            const result = await this.loginUserUseCase.execute(dto);

            if (result.isSuccess) {
                const user = result.getValue();

                // CRITICAL: Check for Admin Role
                if (!user.roles.includes('ADMIN')) {
                    return res.status(403).json({ message: "Access Denied: Admin privileges required." });
                }

                const { accessToken, refreshToken } = user;
                if (accessToken && refreshToken) {
                    this.setCookies(res, accessToken, refreshToken);
                }

                return res.status(200).json({
                    message: "Admin Login successful",
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        roles: user.roles
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
