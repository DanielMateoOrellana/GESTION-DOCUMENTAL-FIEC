import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { Readable } from 'stream';

@Injectable()
export class R2Service implements OnModuleInit {
    private readonly logger = new Logger(R2Service.name);
    private s3Client: S3Client;
    private bucketName: string;

    onModuleInit() {
        const accountId = process.env.R2_ACCOUNT_ID;
        const accessKeyId = process.env.R2_ACCESS_KEY_ID;
        const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
        const bucketName = process.env.R2_BUCKET_NAME;

        if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
            this.logger.warn('R2 credentials not configured. File storage will fail.');
            return;
        }

        this.bucketName = bucketName;
        const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;

        this.s3Client = new S3Client({
            region: 'auto',
            endpoint,
            credentials: { accessKeyId, secretAccessKey },
        });

        this.logger.log(`R2 client initialized for bucket: ${bucketName}`);
    }

    async upload(key: string, body: Buffer | Uint8Array, contentType: string): Promise<string> {
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: body,
            ContentType: contentType,
        });

        await this.s3Client.send(command);
        this.logger.debug(`Uploaded: ${key}`);
        return key;
    }

    async getStream(key: string): Promise<Readable> {
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });

        const response = await this.s3Client.send(command);
        if (!response.Body) {
            throw new Error(`File not found: ${key}`);
        }
        return response.Body as Readable;
    }

    async getBuffer(key: string): Promise<Buffer> {
        const stream = await this.getStream(key);
        return new Promise<Buffer>((resolve, reject) => {
            const chunks: Buffer[] = [];
            stream.on('data', (chunk) => chunks.push(chunk));
            stream.on('end', () => resolve(Buffer.concat(chunks)));
            stream.on('error', reject);
        });
    }

    async delete(key: string): Promise<void> {
        const command = new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });
        await this.s3Client.send(command);
        this.logger.debug(`Deleted: ${key}`);
    }

    generateKey(originalName: string, prefix: string = ''): string {
        const uuid = crypto.randomUUID();
        const sanitizedName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 100);
        return `${prefix}${uuid}-${sanitizedName}`;
    }

    async getPresignedUrl(key: string, expiresIn: number = 900): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            ResponseContentDisposition: 'inline',
            ResponseContentType: 'application/pdf',
        });
        const url = await getSignedUrl(this.s3Client, command, { expiresIn });
        return url;
    }
}
