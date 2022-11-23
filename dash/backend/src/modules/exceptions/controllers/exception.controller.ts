import {ApiBearerAuth, ApiResponse, ApiTags} from '@nestjs/swagger';
import {Body, Controller, Get, Inject, Param, Post, UseGuards, UseInterceptors, Delete, Put} from '@nestjs/common';
import {ResponseTransformerInterceptor} from '../../../interceptors/response-transformer.interceptor';
import {UserProfileDto} from '../../user/dto/user-profile-dto';
import {ExceptionsService} from '../services/exceptions.service';
import {ExceptionCreateDto} from '../dto/exceptioncreateDto';
import {ExceptionListDto} from '../dto/exceptionListDto';
import {AllowedAuthorityLevels} from '../../../decorators/allowed-authority-levels.decorator';
import {Authority} from '../../user/enum/Authority';
import {AuthGuard} from '../../../guards/auth.guard';
import {AuthorityGuard} from '../../../guards/authority.guard';
import {
    LIST_ALL_EXCEPTIONS_RESPONSE_SCHEMA,
    GET_SINGLE_EXCEPTIONS_RESPONSE_SCHEMA,
    CREATE_EXCEPTION_RESPONSE_SCHEMA, UPDATE_EXCEPTION_RESPONSE_SCHEMA
} from '../open-api-schema/exception.schema';
import {ExceptionDto} from '../dto/exception-dto';
import {AuditLogInterceptor} from '../../../interceptors/audit-log.interceptor';

@ApiTags('Exceptions')
@ApiBearerAuth('jwt-auth')
@Controller()
@UseInterceptors(ResponseTransformerInterceptor)
export class ExceptionController {
    constructor(@Inject('LOGGED_IN_USER') private readonly _loggedInUser: UserProfileDto,
                private readonly exceptionsService: ExceptionsService,
    ) {}
    @Get()
    @AllowedAuthorityLevels(Authority.READ_ONLY, Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 201,
        schema: LIST_ALL_EXCEPTIONS_RESPONSE_SCHEMA
    })
    async getAllExceptions(): Promise<ExceptionListDto[]> {
        return await this.exceptionsService.getAllExceptions();
    }

    @Get('/:id')
    @AllowedAuthorityLevels(Authority.READ_ONLY, Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 201,
        schema: GET_SINGLE_EXCEPTIONS_RESPONSE_SCHEMA
    })
    async getExceptionById(@Param('id') exceptionId: number): Promise<ExceptionDto[]> {
        return await this.exceptionsService.getExceptionById(exceptionId);
    }

    @Post('/create')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 201,
        schema: CREATE_EXCEPTION_RESPONSE_SCHEMA
    })
    @UseInterceptors(AuditLogInterceptor)
    async createClusterGroup(@Body() exception: ExceptionCreateDto): Promise<{ id: number, metadata: any }> {
        const createdExceptionId = await this.exceptionsService.createException([{exception}], this._loggedInUser.id);
        const createdException = await this.exceptionsService.getExceptionById(createdExceptionId[0]);
        const metadata = await this.exceptionsService.calculateExceptionMetadata(null, createdException[0]);
        return {id: createdExceptionId[0], metadata};
    }

    @Put('/:id')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: UPDATE_EXCEPTION_RESPONSE_SCHEMA
    })
    @UseInterceptors(AuditLogInterceptor)
    async updateExceptionById(@Body() exception: ExceptionCreateDto, @Param('id') exceptionId: number): Promise<{ id: number, metadata: any }> {
        const previous = (await this.exceptionsService.getExceptionById(exceptionId))[0];
        const updatedExceptionId = await this.exceptionsService.updateException(exception, exceptionId, this._loggedInUser.id);
        const updatedException = (await this.exceptionsService.getExceptionById(updatedExceptionId))[0];
        const metadata = await this.exceptionsService.calculateExceptionMetadata(previous, updatedException);
        return {id: updatedExceptionId, metadata};
    }

    @Delete('/:id')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 201,
        schema: CREATE_EXCEPTION_RESPONSE_SCHEMA
    })
    @UseInterceptors(AuditLogInterceptor)
    async deleteExceptionById(@Param('id') exceptionId: number): Promise<{ id: number, metadata: any }> {
        const previous =  await this.exceptionsService.getExceptionById(exceptionId);
        const metadata = await this.exceptionsService.calculateExceptionMetadata(previous[0], null);
        const deletedExceptionId = await this.exceptionsService.deleteExceptionById(exceptionId, this._loggedInUser.id);
        return {id: deletedExceptionId, metadata};
    }
}
