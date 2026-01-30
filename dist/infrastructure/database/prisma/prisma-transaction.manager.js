"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaTransactionManager = void 0;
class PrismaTransactionManager {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async runInTransaction(fn) {
        return this.prisma.$transaction(async (tx) => fn(tx));
    }
}
exports.PrismaTransactionManager = PrismaTransactionManager;
