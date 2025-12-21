import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
} from '@aws-sdk/client-s3';
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
            this.logger.warn(
                'R2 credentials not fully configured. File storage will fail.',
            );
            return;
        }

        this.bucketName = bucketName;

        // Endpoint de R2 usando el Account ID
        const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;

        this.s3Client = new S3Client({
            region: 'auto', // R2 usa 'auto'
            endpoint,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });

        this.logger.log(`R2 client initialized for bucket: ${bucketName}`);
    }

    /**
     * Sube un archivo a R2
     * @param key - Key única del archivo (ruta en R2)
     * @param body - Buffer del archivo
     * @param contentType - Tipo MIME
     * @returns Key del archivo subido
     */
    async upload(
        key: string,
        body: Buffer | Uint8Array,
        contentType: string,
    ): Promise<string> {
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: body,
            ContentType: contentType,
        });

        await this.s3Client.send(command);
        this.logger.debug(`Uploaded file to R2: ${key}`);
        return key;
    }

    /**
     * Obtiene un archivo de R2 como stream
     * @param key - Key del archivo en R2
     * @returns Stream del archivo
     */
    async getStream(key: string): Promise<Readable> {
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });

        const response = await this.s3Client.send(command);

        if (!response.Body) {
            throw new Error(`File not found in R2: ${key}`);
        }

        // El Body es un Readable stream en Node.js
        return response.Body as Readable;
    }

    /**
     * Obtiene un archivo de R2 como Buffer
     * @param key - Key del archivo en R2
     * @returns Buffer del archivo
     */
    async getBuffer(key: string): Promise<Buffer> {
        const stream = await this.getStream(key);

        return new Promise<Buffer>((resolve, reject) => {
            const chunks: Buffer[] = [];
            stream.on('data', (chunk) => chunks.push(chunk));
            stream.on('end', () => resolve(Buffer.concat(chunks)));
            stream.on('error', reject);
        });
    }

    /**
     * Elimina un archivo de R2
     * @param key - Key del archivo en R2
     */
    async delete(key: string): Promise<void> {
        const command = new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });

        await this.s3Client.send(command);
        this.logger.debug(`Deleted file from R2: ${key}`);
    }

    /**
     * Genera una key única para un archivo
     * @param originalName - Nombre original del archivo
     * @param prefix - Prefijo opcional (ej: 'steps/123/')
     * @returns Key única
     */
    generateKey(originalName: string, prefix: string = ''): string {
        const uuid = crypto.randomUUID();
        const sanitizedName = originalName
            .replace(/[^a-zA-Z0-9._-]/g, '_')
            .substring(0, 100);
        return `${prefix}${uuid}-${sanitizedName}`;
    }
}
