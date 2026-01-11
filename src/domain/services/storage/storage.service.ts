export interface IStorageService {
    /**
     * Generate a pre-signed URL for uploading a file to S3
     * @param key - The S3 object key (file path)
     * @param contentType - The content type of the file (e.g., 'image/jpeg', 'application/pdf')
     * @param expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
     * @returns Pre-signed URL for PUT operation
     */
    getPresignedUploadUrl(key: string, contentType: string, expiresIn?: number): Promise<string>;

    /**
     * Generate a pre-signed URL for downloading/viewing a file from S3
     * @param key - The S3 object key (file path)
     * @param expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
     * @returns Pre-signed URL for GET operation
     */
    getPresignedDownloadUrl(key: string, expiresIn?: number): Promise<string>;

    /**
     * Delete a file from S3
     * @param key - The S3 object key (file path)
     */
    deleteFile(key: string): Promise<void>;
}
