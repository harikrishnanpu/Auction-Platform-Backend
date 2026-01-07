import { Request, Response } from 'express';
import { RegisterUserUseCase } from '../../application/useCases/auth/register-user.usecase';
import { LoginUserUseCase } from '../../application/useCases/auth/login-user.usecase';

export class AuthController {
    constructor(
        private registerUserUseCase: RegisterUserUseCase,
        private loginUserUseCase: LoginUserUseCase
    ) { }

     register = async (req: Request, res: Response):  Promise<void>  => {
        try {
            const dto = req.body;
            const result = await this.registerUserUseCase.execute(dto);

            if (result.isSuccess) {
                res.status(201).json(result.getValue());
            } else {
                res.status(400).json({ error: result.error });
            }
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    login = async (req: Request, res: Response): Promise<void> => {
        try {
            const dto = req.body;
            const result = await this.loginUserUseCase.execute(dto);

            if (result.isSuccess) {
                res.status(200).json(result.getValue());
            } else {
                res.status(401).json({ error: result.error });
            }
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
