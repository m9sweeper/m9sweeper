import {Injectable} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {FileManagementDao} from '../dao/file-management.dao';
import {MineFileDto, MineFileStorage} from '../dto/mine-file.dto';
import {createReadStream, ReadStream, existsSync} from 'fs';
import {S3 as AWSS3, config as AWSConfig} from 'aws-sdk';
import * as stream from "stream";

@Injectable()
export class FileManagementService {

    constructor(private readonly configService: ConfigService,
                private readonly fileManagementDao: FileManagementDao){}


    async save(uploads: any[]): Promise<MineFileDto[]> {
        const files: any[] = uploads.map(u => {
           return {
               display_filename: u.originalname,
               file_storage: this.configService.get('fileManagement.storage'),
               file_unique_id: u.key ?? Buffer.from(`${Date.now()}-${u.filename}`).toString('base64'),
               file_mime_type: u.mimetype,
               file_size: u.size,
               created_at: Date.now()
           }
        });
        return await this.fileManagementDao.save(files);
    }

    async load(fileId: string): Promise<{stream: ReadStream | stream.Readable; details: MineFileDto} | null> {
        const fileDetails: MineFileDto = await this.fileManagementDao.load(fileId);
        if (fileDetails?.storage === MineFileStorage.LOCAL) {
            return {
                stream: this.retrieveLocalFile(fileDetails),
                details: fileDetails
            };
        } else if (fileDetails?.storage === MineFileStorage.S3) {
            return {
                stream: this.retrieveS3File(fileDetails),
                details: fileDetails
            };
        }
        return null;
    }

    private retrieveLocalFile(file: MineFileDto): ReadStream {
        const decodeFileId = Buffer.from(file.fileId, 'base64').toString('ascii').split('-')[1];
        const filePath = `${this.configService.get('common.base.directory')}${this.configService.get('fileManagement.local.dest')}/${decodeFileId}`;
        return existsSync(filePath) ? createReadStream(filePath) : null;
    }

    private retrieveS3File(file: MineFileDto): stream.Readable {
        const s3 = new AWSS3();
        AWSConfig.update({
            accessKeyId: this.configService.get('fileManagement.s3.accessKeyId'),
            secretAccessKey: this.configService.get('fileManagement.s3.accessKeySecret'),
        });

        return ((new AWSS3()).getObject({
            Bucket : this.configService.get('fileManagement.s3.bucketName'),
            Key    : file.fileId,
        })).createReadStream();
    }
}
