import { Module } from '@nestjs/common';
import { FolderDownloadController } from './folder-download.controller';
import { FolderDownloadService } from './folder-download.service';
import { PrismaModule } from '../prisma/prisma.module';
import { R2Module } from '../r2/r2.module';

@Module({
    imports: [PrismaModule, R2Module],
    controllers: [FolderDownloadController],
    providers: [FolderDownloadService],
    exports: [FolderDownloadService],
})
export class FolderDownloadModule { }
