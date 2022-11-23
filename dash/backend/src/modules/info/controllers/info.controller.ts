import {
    Body,
    Controller,
    Get, Post,
    UseInterceptors
} from '@nestjs/common';
import { ResponseTransformerInterceptor } from '../../../interceptors/response-transformer.interceptor';
import {ApiResponse, ApiTags} from '@nestjs/swagger';
import { InfoService } from '../services/info.service';
import {MessagingService} from '../../shared/services/messaging-service';
import { ConfigService } from '@nestjs/config';
import {ALL_INFO_RESPONSE_SCHEMA, INFO_TEST_RESPONSE_SCHEMA} from '../open-api-schema/info.schema';

@ApiTags('Info')

@Controller()
@UseInterceptors(ResponseTransformerInterceptor)
export class InfoController {
    constructor( private readonly infoService: InfoService,
                 private readonly messagingService: MessagingService,
                 private readonly configurationService: ConfigService){}

    @Get()
    @ApiResponse({
        status: 201,
        schema: ALL_INFO_RESPONSE_SCHEMA
    })
    async getDatabaseStatus(): Promise<{appname: string, git_sha: string, build_date: string, git_tag: string}> {
        return this.infoService.getGitInfo();
    }

    @Post('test')
    @ApiResponse({
        status: 201,
        schema: INFO_TEST_RESPONSE_SCHEMA
    })

    async publishRabbitMQMessage(@Body() testMessage: any): Promise<boolean> {
        const queueName = this.configurationService.get('messageQueue.imageScannerQueueName');
        return await this.messagingService.send(queueName, testMessage);
    }

}
