import { TransactionContext } from "../../domain/shared/transaction";

export interface ITransactionManager {
    runInTransaction<T>(fn: (tx: TransactionContext) => Promise<T>): Promise<T>;
}
