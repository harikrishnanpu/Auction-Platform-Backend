import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { IStorageService } from '../../../application/services/storage/storage.service';
import dotenv from 'dotenv';

dotenv.config();

export class S3StorageService implements IStorageService {
    private s3Client: S3Client;
    private bucketName: string;
    private region: string;

    constructor() {
        this.bucketName = process.env.AWS_S3_BUCKET_NAME || '';
        this.region = process.env.AWS_REGION || 'us-east-1';

        this.s3Client = new S3Client({
            region: this.region,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
            },
        });
    }

    async getPresignedUploadUrl(key: string, contentType: string, expiresIn: number = 3600): Promise<string> {
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            ContentType: contentType,
        });

        return await getSignedUrl(this.s3Client, command, { expiresIn });
    }

    async getPresignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });

        return await getSignedUrl(this.s3Client, command, { expiresIn });
    }

    async deleteFile(key: string): Promise<void> {
        const command = new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });

        await this.s3Client.send(command);
    }
}
