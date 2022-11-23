import {ApiBearerAuth, ApiResponse, ApiTags} from '@nestjs/swagger';
import {
    Controller,
    UseInterceptors,
    Get, UseGuards,

} from '@nestjs/common';
import { ResponseTransformerInterceptor } from '../../../interceptors/response-transformer.interceptor';
import {ConfigService} from "@nestjs/config";
import {BASE_URL_SCHEMA} from "../open-api-schema/common-schema";
import {AllowedAuthorityLevels} from "../../../decorators/allowed-authority-levels.decorator";
import {Authority} from "../../user/enum/Authority";
import {AuthGuard} from "../../../guards/auth.guard";
import {AuthorityGuard} from "../../../guards/authority.guard";


@ApiTags('Common')
@ApiBearerAuth('jwt-auth')
@Controller()
@UseInterceptors(ResponseTransformerInterceptor)
export class CommonController {
    constructor(private readonly configService: ConfigService) {}


    @Get('get-config')
    @AllowedAuthorityLevels(Authority.READ_ONLY, Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: BASE_URL_SCHEMA
    })
    async getBaseUrl(): Promise<{baseUrl: string}> {
        const baseUrl = this.configService.get('server.baseUrl');
        return {baseUrl};
    }



}
