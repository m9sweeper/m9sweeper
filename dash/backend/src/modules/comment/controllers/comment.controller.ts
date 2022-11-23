import {ApiBearerAuth, ApiResponse, ApiTags} from '@nestjs/swagger';
import {Body, Controller, Get, Post, Delete, UseInterceptors, Param, UseGuards, Query} from '@nestjs/common';
import {
    ALL_COMMENTS_RESPONSE_SCHEMA,
    CREATE_COMMENTS_RESPONSE_SCHEMA,
    DELETE_COMMENT_RESPONSE_SCHEMA
} from "../open-api-schema/comments-schema";
import { CommentService } from "../services/comment.service";
import { CommentDto } from "../dto/comment-dto";
import { ResponseTransformerInterceptor } from '../../../interceptors/response-transformer.interceptor';
import { AuthGuard } from '../../../guards/auth.guard';
import { AllowedAuthorityLevels } from '../../../decorators/allowed-authority-levels.decorator'
import { AuthorityGuard } from '../../../guards/authority.guard';
import { Authority } from '../../user/enum/Authority';

@ApiTags('Comments')
@ApiBearerAuth('jwt-auth')
@Controller()
@UseInterceptors(ResponseTransformerInterceptor)
export class CommentController{
    constructor(private readonly commentService: CommentService) {}

    @Get('/exception/:id')
    @AllowedAuthorityLevels(Authority.READ_ONLY, Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: ALL_COMMENTS_RESPONSE_SCHEMA
    })
    async getAllComments(@Param('id') exceptionId: number): Promise<CommentDto[]>{
       return await this.commentService.getAllComments(exceptionId);
    }

    @Post()
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: CREATE_COMMENTS_RESPONSE_SCHEMA
    })
    async createTag(@Body() comment: CommentDto): Promise<number>{
       return await this.commentService.createComment(comment);
    }

    @Delete(':id')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: DELETE_COMMENT_RESPONSE_SCHEMA
    })
    async deleteClusterById(@Param('id') id: number): Promise<number> {
        return await this.commentService.deleteCommentById(id);
    }

}
