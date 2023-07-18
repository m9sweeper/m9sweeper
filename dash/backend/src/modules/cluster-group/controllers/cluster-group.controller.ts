import {ApiBearerAuth, ApiResponse, ApiTags} from '@nestjs/swagger';
import {
    Body,
    Controller,
    Delete,
    Get,
    Inject,
    NotFoundException,
    Param,
    Post,
    Put,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import {ResponseTransformerInterceptor} from "../../../interceptors/response-transformer.interceptor";
import {UserProfileDto} from "../../user/dto/user-profile-dto";
import {ClusterGroupService} from "../services/cluster-group-service";
import { CLUSTER_GROUP_RESPONSE_SCHEMA, UPDATE_CLUSTER_RESPONSE_SCHEMA } from "../open-api-schema/cluster-group-schema";
import {ClusterGroupDto} from "../dto/cluster-group-dto";
import { AllowedAuthorityLevels } from '../../../decorators/allowed-authority-levels.decorator'
import { AuthorityGuard } from '../../../guards/authority.guard';
import {AuthGuard} from '../../../guards/auth.guard';
import {Authority} from '../../user/enum/Authority';

@ApiTags('clusterGroup')
@ApiBearerAuth('jwt-auth')
@Controller()
@UseInterceptors(ResponseTransformerInterceptor)
export class ClusterGroupController {
    constructor(@Inject('LOGGED_IN_USER') private readonly _loggedInUser: UserProfileDto,
                private readonly clusterGroupService: ClusterGroupService) {}

    @Get(':clusterGroupId')
    @AllowedAuthorityLevels(Authority.READ_ONLY, Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: CLUSTER_GROUP_RESPONSE_SCHEMA
    })
    async getClusterGroupById(@Param('clusterGroupId') clusterGroupId: number): Promise<ClusterGroupDto> {
        return this.clusterGroupService.getClusterGroupById(clusterGroupId)
          .then(group => {
              if (!group) {
                  throw new NotFoundException('Cluster Group not found');
              }
              return group;
          });
    }

    @Post()
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: CLUSTER_GROUP_RESPONSE_SCHEMA
    })
    async createClusterGroup(@Body() clusterGroupData: ClusterGroupDto): Promise<ClusterGroupDto> {
        return this.clusterGroupService.createClusterGroup(clusterGroupData);
    }

    @Put(':clusterGroupId')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: UPDATE_CLUSTER_RESPONSE_SCHEMA
    })
    async updateClusterGroup(@Body() clusterGroupData: ClusterGroupDto, @Param('clusterGroupId') clusterGroupId: number): Promise<number> {
        return this.clusterGroupService.updateClusterGroup(clusterGroupData, clusterGroupId);
    }

    @Delete(':clusterGroupId')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: UPDATE_CLUSTER_RESPONSE_SCHEMA
    })
    async deleteClusterGroup(@Param('clusterGroupId') clusterGroupId: number): Promise<number> {
        return this.clusterGroupService.deleteClusterGroup(clusterGroupId);
    }

    @Get('')
    @AllowedAuthorityLevels(Authority.READ_ONLY, Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: CLUSTER_GROUP_RESPONSE_SCHEMA
    })
    async getAllClusters(): Promise<ClusterGroupDto[]> {
        return this.clusterGroupService.getClusterGroups();
    }
}
