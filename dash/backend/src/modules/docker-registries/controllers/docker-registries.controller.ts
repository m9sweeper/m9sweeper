import {
    Body,
    Controller,
    Delete,
    Get,
    Inject,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { UserProfileDto } from '../../user/dto/user-profile-dto';
import { AuthGuard } from '../../../guards/auth.guard';
import { ResponseTransformerInterceptor } from '../../../interceptors/response-transformer.interceptor';
import {ApiBearerAuth, ApiQuery, ApiResponse, ApiSecurity, ApiTags} from '@nestjs/swagger';
import {
    UPDATE_DOCKER_REGISTRY_RESPONSE_SCHEMA,
    DELETE_DOCKER_REGISTRY_RESPONSE_SCHEMA,
    GET_SINGLE_DOCKER_REGISTRY_RESPONSE_SCHEMA,
    DockerRegistriesResponseDto,
    DockerRegistriesDataDto
} from '../open-api-schema/docker-registries-schema';
import { DockerRegistriesDto } from '../dto/docker-registries-dto';
import { DockerRegistriesService} from '../services/docker-registries.service';
import { AllowedAuthorityLevels } from '../../../decorators/allowed-authority-levels.decorator'
import { AuthorityGuard } from '../../../guards/authority.guard';
import { Authority } from '../../user/enum/Authority';
import {AuditLogInterceptor} from '../../../interceptors/audit-log.interceptor';
import {AuthService} from '../../auth/services/auth.service'

@ApiTags('Docker-Registries')
@ApiBearerAuth('jwt-auth')
@Controller()
@UseInterceptors(ResponseTransformerInterceptor)
export class DockerRegistriesController {
    constructor(@Inject('LOGGED_IN_USER') private readonly _loggedInUser: UserProfileDto,
                private readonly dockerRegistriesService: DockerRegistriesService,
                private readonly authService: AuthService,
                ){}

    @Get(':dockerRegistryId')
    @AllowedAuthorityLevels(Authority.READ_ONLY, Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: GET_SINGLE_DOCKER_REGISTRY_RESPONSE_SCHEMA
    })
    async getDockerRegistryById(@Param('dockerRegistryId') dockerRegistryId: number): Promise<DockerRegistriesDto> {
        return this.dockerRegistriesService.getDockerRegistryById(dockerRegistryId, this.authService.isCurrentUserReadOnly);
    }

    @ApiTags('M9Sweeper')
    @ApiSecurity('x-auth-token')
    @Get()
    @ApiResponse({
        status: 200,
        type: DockerRegistriesResponseDto
    })
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY, Authority.TRAWLER)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiQuery({name: 'page', required: false})
    @ApiQuery({name: 'limit', required: false})
    @ApiQuery({name: 'sort-by', required: false})
    @ApiQuery({name: 'sort-direction', required: false})
    @ApiQuery({name: 'login-required', required: false})
    @ApiQuery({name: 'auth-type', required: false})
    @ApiQuery({name: 'url', required: false})
    async getDockerRegistries(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('sort-by') sortField?: string,
        @Query('sort-direction') sortDirection?: string,
        @Query('login-required') loginRequired?: string,
        @Query('auth-type') authType?: string,
        @Query('url') url?: string,
    ): Promise<DockerRegistriesDataDto> {
        return this.dockerRegistriesService.getDockerRegistries({page, limit, sortField, sortDirection,
            loginRequired, authType, url}, this.authService.isCurrentUserReadOnly);
    }

    @Post()
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: GET_SINGLE_DOCKER_REGISTRY_RESPONSE_SCHEMA
    })
    @UseInterceptors(AuditLogInterceptor)
    async createDockerRegistry(@Body() dockerRegistry: DockerRegistriesDto): Promise<DockerRegistriesDto> {
        const createdDockerRegistry = await this.dockerRegistriesService.createDockerRegistry(dockerRegistry);
        createdDockerRegistry.metadata = await this.dockerRegistriesService.calculatePolicyMetadata(null, createdDockerRegistry);
        return createdDockerRegistry;
    }

    @Put(':dockerRegistryId')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: UPDATE_DOCKER_REGISTRY_RESPONSE_SCHEMA
    })
    @UseInterceptors(AuditLogInterceptor)
    async updateCluster(@Body() dockerRegistry: DockerRegistriesDto, @Param('dockerRegistryId') id: number): Promise<{ id: number, metadata: any }> {
        const previous = await this.dockerRegistriesService.getDockerRegistryById(id, this.authService.isCurrentUserReadOnly);
        const updateDockerRegistryId =  await this.dockerRegistriesService.updateDockerRegistry(dockerRegistry,id);
        const updatedDockerRegistry = await this.dockerRegistriesService.getDockerRegistryById(id, this.authService.isCurrentUserReadOnly);
        const metadata = await this.dockerRegistriesService.calculatePolicyMetadata(previous, updatedDockerRegistry);
        return {id: updateDockerRegistryId, metadata}
    }

    @Delete(':dockerRegistryId')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: DELETE_DOCKER_REGISTRY_RESPONSE_SCHEMA
    })
    @UseInterceptors(AuditLogInterceptor)
    async deleteDockerRegistryById(@Param('dockerRegistryId') id: number): Promise<{ id: number, metadata: any }> {
        const previous = await this.dockerRegistriesService.getDockerRegistryById(id, this.authService.isCurrentUserReadOnly);
        const metadata = await this.dockerRegistriesService.calculatePolicyMetadata(previous, null);
        const deletedDockerRegistry =  await this.dockerRegistriesService.deleteDockerRegistryById(id);
        return {id: deletedDockerRegistry, metadata};
    }
}
