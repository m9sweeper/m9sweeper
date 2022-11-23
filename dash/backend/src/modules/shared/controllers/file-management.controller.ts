import {Controller, Get, HttpStatus, Param, Post, Res, UploadedFiles, UseGuards, UseInterceptors} from '@nestjs/common';
import {AnyFilesInterceptor} from '@nestjs/platform-express';
import {FileManagementService} from '../services/file-management.service';
import {AuthGuard} from '../../../guards/auth.guard';
import {ResponseTransformerInterceptor} from '../../../interceptors/response-transformer.interceptor';
import {MineFileDto} from '../dto/mine-file.dto';
import {ApiBearerAuth, ApiBody, ApiConsumes, ApiResponse, ApiTags} from '@nestjs/swagger';
import {UPLOAD_FILES_REQUEST_SCHEMA, UPLOAD_FILES_RESPONSE_SCHEMA} from '../open-api-schema/file-management-schema';

@ApiTags('File Management')
@ApiBearerAuth('jwt-auth')
@UseGuards(AuthGuard)
@UseInterceptors(ResponseTransformerInterceptor)
@Controller('file-management')
export class FileManagementController {

    constructor(private readonly fileManagementService: FileManagementService){}

    @Post('upload')
    @UseInterceptors(AnyFilesInterceptor())
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        required: true,
        schema: UPLOAD_FILES_REQUEST_SCHEMA
    })
    @ApiResponse({
        status: 201,
        schema: UPLOAD_FILES_RESPONSE_SCHEMA
    })
    async uploadFiles(@UploadedFiles() uploads: any[]): Promise<MineFileDto[]> {
        return await this.fileManagementService.save(uploads);
    }

    @Get(':fileId')
    async viewFile(@Param('fileId') fileId: string, @Res() res) {
        const file = await this.fileManagementService.load(fileId);
        if (file) {
            res.set({
                'Content-Type': file.details.contentType,
                'Content-Length': file.details.contentSize,
                'Content-Disposition': `attachment; filename=${file.details.fileName}`
            });
            file.stream.on('close', () => {
                res.end()
            });
            file.stream.on('error', (error) => {
                console.log('Error: ',error);
                res.end()
            });
            file.stream.pipe(res);
        } else {
            res.status(HttpStatus.NOT_FOUND).send();
        }
    }

}
