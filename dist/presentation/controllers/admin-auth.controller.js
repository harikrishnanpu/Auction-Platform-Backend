"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAuthController = void 0;
const auth_validator_1 = require("../validators/auth.validator");
const http_status_constants_1 = require("../../application/constants/http-status.constants");
const response_messages_1 = require("../../application/constants/response.messages");
class AdminAuthController {
    constructor(loginAdminUseCase) {
        this.loginAdminUseCase = loginAdminUseCase;
        this.login = async (req, res) => {
            try {
                const parseResult = auth_validator_1.loginSchema.safeParse(req.body);
                if (!parseResult.success) {
                    return res.status(http_status_constants_1.HttpStatus.BAD_REQUEST).json({ errors: parseResult.error.errors });
                }
                const dto = parseResult.data;
                const result = await this.loginAdminUseCase.execute(dto);
                if (result.isSuccess) {
                    const user = result.getValue();
                    const { accessToken, refreshToken } = user;
                    if (accessToken && refreshToken) {
                        this.setCookies(res, accessToken, refreshToken);
                    }
                    return res.status(http_status_constants_1.HttpStatus.OK).json({
                        message: response_messages_1.ResponseMessages.ADMIN_LOGIN_SUCCESS,
                        admin: {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            roles: user.roles,
                            accessToken: user.accessToken,
                            refreshToken: user.refreshToken
                        }
                    });
                }
                else {
                    return res.status(http_status_constants_1.HttpStatus.UNAUTHORIZED).json({ message: result.error });
                }
            }
            catch (err) {
                console.log(err);
                return res.status(http_status_constants_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: response_messages_1.ResponseMessages.INTERNAL_SERVER_ERROR });
            }
        };
    }
    setCookies(res, accessToken, refreshToken) {
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
}
exports.AdminAuthController = AdminAuthController;
