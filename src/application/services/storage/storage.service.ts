export interface IStorageService {
    getPresignedUploadUrl(key: string, contentType: string, expiresIn?: number): Promise<string>;
    getPresignedDownloadUrl(key: string, expiresIn?: number): Promise<string>;
    deleteFile(key: string): Promise<void>;
}
