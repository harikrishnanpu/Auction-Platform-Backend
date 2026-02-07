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
const result_1 = require("../../../domain/shared/result");
class UpdateUserUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(userId, dto) {
        const user = await this.userRepository.findById(userId);
        if (!user)
            return result_1.Result.fail("User not found");
        // Update fields
        if (dto.name !== undefined) {
            user.props.name = dto.name;
        }
        if (dto.email !== undefined) {
            const { Email } = await Promise.resolve().then(() => __importStar(require("../../../domain/user/email.vo")));
            const emailResult = Email.create(dto.email);
            if (emailResult.isFailure)
                return result_1.Result.fail(emailResult.error);
            user.props.email = emailResult.getValue();
        }
        if (dto.phone !== undefined) {
            user.props.phone = dto.phone;
        }
        if (dto.address !== undefined) {
            user.props.address = dto.address;
        }
        if (dto.avatar_url !== undefined) {
            user.props.avatar_url = dto.avatar_url;
        }
        await this.userRepository.save(user);
        return result_1.Result.ok(undefined);
    }
}
exports.UpdateUserUseCase = UpdateUserUseCase;
