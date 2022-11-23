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
import {AuthGuard} from '../../../guards/auth.guard';
import {ResponseTransformerInterceptor} from '../../../interceptors/response-transformer.interceptor';
import {ApiBearerAuth, ApiResponse, ApiTags} from '@nestjs/swagger';
import { CLUSTER_EVENT_RESPONSE_SCHEMA, CREATE_CLUSTER_EVENT_RESPONSE_SCHEMA} from '../open-api-schema/cluster-event-schema';
import {ClusterEventDto} from '../dto/cluster-event-dto';
import {ClusterEventService} from '../services/cluster-event.service';
import { AllowedAuthorityLevels } from '../../../decorators/allowed-authority-levels.decorator'
import { AuthorityGuard } from '../../../guards/authority.guard';
import {Authority} from '../../user/enum/Authority';
import {ClusterEventCreateDto} from '../dto/cluster-event-create-dto';

@ApiTags('ClusterEvents')
@ApiBearerAuth('jwt-auth')
@Controller()
@UseInterceptors(ResponseTransformerInterceptor)
export class ClusterEventController {
    constructor(@Inject('LOGGED_IN_USER') private readonly _loggedInUser: UserProfileDto,
                private readonly clusterEventService: ClusterEventService,
    ){}

    @Get('')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: CLUSTER_EVENT_RESPONSE_SCHEMA
    })
    async getClusterEvents(
        @Param('clusterId') clusterId: number,
        @Query('limit') limit: number,
        @Query('page') page: number): Promise<ClusterEventDto[]> {
        return await this.clusterEventService.getAllClusterEvents(limit, page, clusterId);
    }

    @Post()
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: CREATE_CLUSTER_EVENT_RESPONSE_SCHEMA
    })
    async createClusterEvent(@Body() clusterEvent: ClusterEventCreateDto, @Param('clusterId') clusterId: number): Promise<{id: number}[]> {
        return await this.clusterEventService.createClusterEvent(clusterEvent, clusterId);
    }
}
