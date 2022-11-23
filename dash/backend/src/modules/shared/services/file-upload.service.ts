import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {MulterModuleOptions, MulterOptionsFactory} from '@nestjs/platform-express';
import {MulterOptions} from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { ConfigService } from '@nestjs/config';
import { extname } from 'path';
import {S3 as AWSS3, config as AWSConfig} from 'aws-sdk';
import * as multerS3 from 'multer-s3';

@Injectable()
export class FileUploadService implements MulterOptionsFactory {

    constructor(private readonly configService: ConfigService) {}

    createMulterOptions(): Promise<MulterModuleOptions> | MulterOptions {
        const config: MulterOptions = {
            limits: {
                fileSize: this.configService.get('fileManagement.maxFileSize'),
            },
            fileFilter: (req: any, file: any, cb: any) => {
                if (file.mimetype.match(/\/(jpg|jpeg|png|gif|doc|docx|pdf|xls|xlsx|csv|tsv)$/)) {
                    cb(null, true);
                } else {
                    cb(new HttpException(`Unsupported file type ${extname(file.originalname)}`, HttpStatus.BAD_REQUEST), false);
                }
            }
        };

        if (this.configService.get('fileManagement.storage') === 'local') {
            config.dest = `${this.configService.get('common.base.directory')}${this.configService.get('fileManagement.local.dest')}`;
        }

        if (this.configService.get('fileManagement.storage') === 's3') {
            AWSConfig.update({
                accessKeyId: this.configService.get('fileManagement.s3.accessKeyId'),
                secretAccessKey: this.configService.get('fileManagement.s3.accessKeySecret'),
            });
            config.storage = multerS3({
                s3: new AWSS3(),
                bucket: this.configService.get('fileManagement.s3.bucketName')
            })
        }

        return config;
    }

}
