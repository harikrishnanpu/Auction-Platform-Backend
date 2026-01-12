import { ItokenGenerator } from "@domain/services/token/token.service";
import {  v4 as uuidv4 } from "uuid";



export class TokenGenerator implements ItokenGenerator {

    generateToken(length: number = 32): string {
        return uuidv4().replace(/-/g, '').slice(0, length);
    }
}