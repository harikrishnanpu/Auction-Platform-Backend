import { JwtServiceImpl } from "@infrastructure/security/jwt.service";
import { BcryptPasswordHasher } from "@infrastructure/security/password-hasher";



export const passwordHasher = new BcryptPasswordHasher();
export const jwtService = new JwtServiceImpl();