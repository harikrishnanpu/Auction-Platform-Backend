import { PrismaClient } from "@prisma/client";
import { ITransactionManager, TransactionContext } from "../../../application/ports/transaction.port";

export class PrismaTransactionManager implements ITransactionManager {
    constructor(private prisma: PrismaClient) { }

    async runInTransaction<T>(fn: (tx: TransactionContext) => Promise<T>): Promise<T> {
        return this.prisma.$transaction(async (tx) => fn(tx as TransactionContext));
    }
}
