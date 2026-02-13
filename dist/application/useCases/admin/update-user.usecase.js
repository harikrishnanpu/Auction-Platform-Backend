"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserUseCase = void 0;
const result_1 = require("@result/result");
const email_vo_1 = require("@domain/value-objects/user/email.vo");
class UpdateUserUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(userId, dto) {
        const user = await this.userRepository.findById(userId);
        if (!user)
            return result_1.Result.fail("User not found");
        if (dto.name !== undefined)
            user.update({ name: dto.name });
        if (dto.email !== undefined) {
            const emailResult = email_vo_1.Email.create(dto.email);
            if (emailResult.isFailure)
                return result_1.Result.fail(emailResult.error);
            user.update({ email: emailResult.getValue() });
        }
        if (dto.phone !== undefined) {
            const { Phone } = await Promise.resolve().then(() => __importStar(require("@domain/value-objects/user/phone.vo")));
            const phoneResult = Phone.create(dto.phone);
            if (phoneResult.isFailure)
                return result_1.Result.fail(phoneResult.error);
            user.update({ phone: phoneResult.getValue() });
        }
        if (dto.address !== undefined)
            user.update({ address: dto.address });
        if (dto.avatar_url !== undefined)
            user.update({ avatar_url: dto.avatar_url });
        await this.userRepository.save(user);
        return result_1.Result.ok({
            id: user.id,
            name: user.name,
            email: user.email.getValue(),
            roles: user.roles,
            is_blocked: user.is_blocked,
            is_verified: user.is_verified,
            created_at: user.created_at
        });
    }
}
exports.UpdateUserUseCase = UpdateUserUseCase;
