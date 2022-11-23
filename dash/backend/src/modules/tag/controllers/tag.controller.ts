import {ApiBearerAuth, ApiResponse, ApiTags} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  Post,
  Delete,
  UseInterceptors,
  Param,
  UseGuards,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { ALL_TAGS_RESPONSE_SCHEMA, CREATE_TAGS_RESPONSE_SCHEMA, DELETE_TAGS_RESPONSE_SCHEMA } from '../open-api-schema/tags-schema';
import { TagService } from '../services/tag.service';
import { TagDto } from '../dto/tag-dto';
import { ResponseTransformerInterceptor } from '../../../interceptors/response-transformer.interceptor';
import { AuthGuard } from '../../../guards/auth.guard';
import { TagCreateDto } from '../dto/tag-create-dto';
import { AllowedAuthorityLevels } from '../../../decorators/allowed-authority-levels.decorator'
import { AuthorityGuard } from '../../../guards/authority.guard';
import {Authority} from '../../user/enum/Authority';
import {MineLoggerService} from "../../shared/services/mine-logger.service";

@ApiTags('Tags')
@ApiBearerAuth('jwt-auth')
@Controller()
@UseInterceptors(ResponseTransformerInterceptor)
export class TagController{
    constructor(
      private readonly tagService: TagService,
      private readonly loggerService: MineLoggerService,
    ) {}

    @Get()
    @AllowedAuthorityLevels(Authority.READ_ONLY, Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: ALL_TAGS_RESPONSE_SCHEMA
    })
    async getTagList(): Promise<TagDto[]>{
       return await this.tagService.getAllTags();
    }

    @Post()
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: CREATE_TAGS_RESPONSE_SCHEMA
    })
    async createTag(@Body() tag: TagCreateDto): Promise<TagDto>{
       this.loggerService.debug({label: 'About to create a tag', data: {tagInfo: tag}}, 'TagController.createTag');
       return await this.tagService.createTag(tag);
    }

    @Delete(':tagId/:clusterId')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: DELETE_TAGS_RESPONSE_SCHEMA
    })
    async deleteTagById(@Param('tagId') id: number, @Param('clusterId') clusterId: number): Promise<number>{
        return await this.tagService.deleteTagById(id, clusterId);
    }

}
