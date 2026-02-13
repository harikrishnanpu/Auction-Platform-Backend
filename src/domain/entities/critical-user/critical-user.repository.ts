import { CriticalUserEntity, CreateCriticalUserDTO, UpdateCriticalUserDTO } from './critical-user.entity';

export interface ICriticalUserRepository {
    create(data: CreateCriticalUserDTO): Promise<CriticalUserEntity>;
    findById(id: string): Promise<CriticalUserEntity | null>;
    findByUserId(userId: string): Promise<CriticalUserEntity[]>;
    findUnresolvedByUser(userId: string): Promise<CriticalUserEntity[]>;
    update(id: string, data: UpdateCriticalUserDTO): Promise<CriticalUserEntity>;
    markUserAsCritical(userId: string): Promise<void>;
    delete(id: string): Promise<void>;
}
