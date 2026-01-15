import { IResetTokenService } from "@application/services/token/reset.token.service";
import {  v4 as uuidv4 } from "uuid";



export class ResetTokenService implements IResetTokenService {

    generateToken(length: number = 32): string {
        return uuidv4().replace(/-/g, '').slice(0, length);
    }
}