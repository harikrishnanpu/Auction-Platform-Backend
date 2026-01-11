"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAuthController = void 0;
const auth_validator_1 = require("../validators/auth.validator");
class AdminAuthController {
    constructor(loginUserUseCase) {
        this.loginUserUseCase = loginUserUseCase;
        this.login = async (req, res) => {
            try {
                const parseResult = auth_validator_1.loginSchema.safeParse(req.body);
                if (!parseResult.success) {
                    return res.status(400).json({ errors: parseResult.error.errors });
                }
                const dto = parseResult.data;
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
                }
                else {
                    return res.status(401).json({ message: result.error });
                }
            }
            catch (err) {
                console.log(err);
                return res.status(500).json({ message: 'Internal Server Error' });
            }
        };
    }
    setCookies(res, accessToken, refreshToken) {
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000 // 15 minutes
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
    }
}
exports.AdminAuthController = AdminAuthController;
