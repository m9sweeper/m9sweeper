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
import {ApiBearerAuth, ApiResponse, ApiSecurity, ApiTags} from '@nestjs/swagger';
import {
    GROUP_BY_ID_CLUSTER_RESPONSE_SCHEMA,
    SEARCH_BY_GROUP_CLUSTER_RESPONSE_SCHEMA,
    CREATE_CLUSTER_RESPONSE_SCHEMA,
    UPDATE_CLUSTER_SCHEMA_RESPONSE,
    ALL_CLUSTER_LIST_RESPONSE_SCHEMA,
    DELETE_CLUSTER_RESPONSE_SCHEMA, ClusterResponse
} from '../open-api-schema/cluster-schema';
import { ClusterDto } from '../dto/cluster-dto';
import {ClusterService} from '../services/cluster.service';
import { AllowedAuthorityLevels } from '../../../decorators/allowed-authority-levels.decorator'
import { AuthorityGuard } from '../../../guards/authority.guard';
import {Authority} from '../../user/enum/Authority';
import {KubernetesClusterService} from '../../command-line/services/kubernetes-cluster.service';
import {DeprecatedGatekeeperTemplateDto} from "../dto/deprecated-gatekeeper-template-dto";
import {GatekeeperConstraintDetailsDto} from "../dto/deprecated-gatekeeper-constraint-dto";
import {KubernetesApiService} from "../../command-line/services/kubernetes-api.service";
import {AuditLogInterceptor} from "../../../interceptors/audit-log.interceptor";
import { MineLoggerService } from '../../shared/services/mine-logger.service';

@ApiTags('Clusters')
@ApiBearerAuth('jwt-auth')
@Controller()
@UseInterceptors(ResponseTransformerInterceptor)
export class ClusterController {
    constructor(
      @Inject('LOGGED_IN_USER') private readonly _loggedInUser: UserProfileDto,
      private readonly clusterService: ClusterService,
      private readonly kubernetesClusterService: KubernetesClusterService,
      private readonly  kubernetesApiService: KubernetesApiService,
      private logger: MineLoggerService
    ) {}

    @Get()
    @AllowedAuthorityLevels(Authority.READ_ONLY, Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: ALL_CLUSTER_LIST_RESPONSE_SCHEMA
    })
    async getAllClusters(): Promise<ClusterDto[]> {
        const clusters: ClusterDto[] = await this.clusterService.getAllClusters();
        return clusters && clusters.map(c => {
            delete c.kubeConfig;
            delete c.ipAddress;
            delete c.port;
            delete c.context;
            return c;
        });
    }

    @ApiTags('M9Sweeper')
    @ApiSecurity('x-auth-token')
    @Get(':clusterId')
    @ApiResponse({
        status: 200,
        type: ClusterResponse
    })
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY, Authority.TRAWLER)
    @UseGuards(AuthGuard, AuthorityGuard)
    async getClusterById(@Param('clusterId') clusterId: number): Promise<ClusterDto> {
        const cluster = await this.clusterService.getClusterById(clusterId);
        delete cluster.kubeConfig;
        return cluster;
    }

    @ApiTags('M9Sweeper')
    @ApiSecurity('x-auth-token')
    @Get('by-name/:clusterName')
    @ApiResponse({
        status: 200,
        type: ClusterResponse
    })
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.TRAWLER)
    @UseGuards(AuthGuard, AuthorityGuard)
    async getClusterByClusterName(@Param('clusterName') clusterName: string): Promise<ClusterDto> {
        const clusters: ClusterDto[] = await this.clusterService.searchClustersByName(clusterName);
        if (clusters && clusters.length){
            return clusters.map(c => {
                delete c.kubeConfig;
                return c;
            })[0];
        }
        return null;
    }

    @Get('group-by/:groupId')
    @ApiResponse({
        status: 200,
        schema: GROUP_BY_ID_CLUSTER_RESPONSE_SCHEMA
    })
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY)
    @UseGuards(AuthGuard, AuthorityGuard)
    async getClusterListByGroupId(@Param('groupId') groupId: number): Promise<ClusterDto[]> {
        const clusters = await this.clusterService.getClustersByGroupId(groupId);
        return clusters && clusters.map(c => {
            delete c.kubeConfig;
            return c;
        });
    }

    @Get('search-by-group/:groupId')
    @ApiResponse({
        status: 200,
        schema: SEARCH_BY_GROUP_CLUSTER_RESPONSE_SCHEMA
    })
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    async searchClusters(@Param('groupId') groupId: number, @Query('q') searchTerm: string): Promise<ClusterDto[]> {
        const clusters =  await this.clusterService.searchClusters(groupId, searchTerm);
        return clusters && clusters.map(c => {
            delete c.kubeConfig;
            // delete c.ipAddress;
            delete c.port;
            // delete c.context;
            return c;
        });
    }

    @Post('test-service-account')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    async testConfig(@Body() body: {server: string, token: string, context: string}): Promise<{valid: boolean, config: string, context?: string}> {
        // Provide a default name for the context if necessary
        const context = body.context || 'm9sweeper-service-account';
        return await this.kubernetesApiService.buildAndTestServiceAccountConfig(body.server, body.token, context);
    }

    @Post()
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: CREATE_CLUSTER_RESPONSE_SCHEMA
    })
    @UseInterceptors(AuditLogInterceptor)
    async createCluster(@Body() cluster: ClusterDto & {installWebhook: 'automatically' | 'manually', serviceAccountConfig: string}): Promise<ClusterDto> {
        const installWebhook = cluster.installWebhook === 'automatically';
        const serviceAccountConfig = cluster.serviceAccountConfig;
        delete cluster.installWebhook;
        delete cluster.serviceAccountConfig;
        const response: ClusterDto  = await this.clusterService.createCluster(cluster, installWebhook, serviceAccountConfig);
        response.metadata = await this.clusterService.calculateClusterMetaData(null, response);
        this.kubernetesClusterService.sync(response).then(results => {
            this.logger.log({label: 'K8s cluster synced', data: { results }}, 'ClusterController.createCluster');
        }).catch(e => {
            this.logger.error({label: 'Error syncing K8s cluster'}, e, 'ClusterController.createCluster');
        });
        return response;
    }

    @Put(':clusterId')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: UPDATE_CLUSTER_SCHEMA_RESPONSE
    })
    @UseInterceptors(AuditLogInterceptor)
    async updateCluster(@Body() cluster: ClusterDto & {installWebhook: 'automatically' | 'manually', serviceAccountConfig: string}, @Param('clusterId') id: number): Promise<ClusterDto> {
        const previous = await this.getClusterById(id);
        delete previous.kubeConfig;

        const installWebhook = cluster.installWebhook === 'automatically';
        const serviceAccountConfig = cluster.serviceAccountConfig;
        const rerunWizard = serviceAccountConfig && installWebhook;
        if (cluster.serviceAccountConfig) {
            delete cluster.serviceAccountConfig;
        }
        if (cluster.installWebhook) {
            delete cluster.installWebhook;
        }

        const updatedCluster = await  this.clusterService.updateCluster(cluster,id, installWebhook, serviceAccountConfig, rerunWizard);
        updatedCluster.metadata = await this.clusterService.calculateClusterMetaData(previous, updatedCluster);
        return updatedCluster;
    }

    @Delete(':id')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: DELETE_CLUSTER_RESPONSE_SCHEMA
    })
    @UseInterceptors(AuditLogInterceptor)
    async deleteClusterById(@Param('id') id: number): Promise<ClusterDto> {
        const previous = await this.clusterService.getClusterById(id);
        previous.kubeConfig = null;
        const cluster = await this.clusterService.deleteClusterById(id);
        cluster.metadata = await this.clusterService.calculateClusterMetaData(previous, null);
        return cluster;
    }

    @Get('/opa/:clusterId/gatekeeper-constraint-templates')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 201,
        schema: DELETE_CLUSTER_RESPONSE_SCHEMA
    })
    async getOPAGateKeeperConstraintTemplates(@Param('clusterId') clusterId: number): Promise<DeprecatedGatekeeperTemplateDto[]> {
        return this.clusterService.getOPAGateKeeperConstraintTemplates(clusterId);
    }

    @Post('/opa/:clusterId/gatekeeper-constraint-templates')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 201,
        schema: DELETE_CLUSTER_RESPONSE_SCHEMA
    })
    async deployOPAGateKeeperConstraintTemplates( @Body() templateName: {templateName: string}, @Param('clusterId') clusterId: number): Promise<{message: string, statusCode: number}> {
        return this.clusterService.deployOPAGateKeeperConstraintTemplates(clusterId, templateName.templateName);
    }

    @Get('/opa/:clusterId/gatekeeper-constraint-templates/:templateName')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 201,
        schema: DELETE_CLUSTER_RESPONSE_SCHEMA
    })
    async getOPAGateKeeperConstraintTemplateByName(@Param('clusterId') clusterId: number,
                                                   @Param('templateName') templateName: string): Promise<DeprecatedGatekeeperTemplateDto> {
        return this.clusterService.getOPAGateKeeperConstraintTemplateByName(clusterId, templateName);
    }

    @Get('/opa/:clusterId/gatekeeper-constraint-templates/:templateName/raw')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 201,
        schema: DELETE_CLUSTER_RESPONSE_SCHEMA
    })
    async getOPAGateKeeperConstraintTemplateByNameRaw(@Param('clusterId') clusterId: number,
                                                   @Param('templateName') templateName: string): Promise<any> {
        return this.clusterService.getOPAGateKeeperConstraintTemplateByNameRaw(clusterId, templateName);
    }

    @Delete('/opa/:clusterId/gatekeeper-constraint-templates/:templateName')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 201,
        schema: DELETE_CLUSTER_RESPONSE_SCHEMA
    })
    async destroyOPAGateKeeperConstraintTemplateByName(@Param('clusterId') clusterId: number,
                                                   @Param('templateName') templateName: string): Promise<{message: string; status: number}> {
        return this.clusterService.destroyOPAGateKeeperConstraintTemplateByName(clusterId, templateName);
    }


    // loading the template dir names for the "Add Constraint Templates" Dialog
    @Get('/opa/:clusterId/gatekeeper-templates/dirs')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 201,
        schema: DELETE_CLUSTER_RESPONSE_SCHEMA
    })
    async getOPAGateKeeperTemplateDirList(@Param('clusterId') clusterId: number): Promise<{ [dirName: string]: string[] }> {
        return this.clusterService.getDirectoryStructure();
    }

    @Get('/opa/:clusterId/gatekeeper-templates/:dir/:subDir')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 201,
        schema: DELETE_CLUSTER_RESPONSE_SCHEMA
    })
    async getOPAGateKeeperTemplate(@Param('clusterId') clusterId: number,
                                   @Param('dir') dir: string,
                                   @Param('subDir') subDir: string): Promise<DeprecatedGatekeeperTemplateDto> {
        return this.clusterService.loadGatekeeperTemplate(dir, subDir, clusterId);
    }

    @Get('/opa/:clusterId/gatekeeper-templates/raw/:dir/:subDir')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 201,
        schema: DELETE_CLUSTER_RESPONSE_SCHEMA
    })
    async getRawOPAGateKeeperTemplate(@Param('clusterId') clusterId: number,
                                      @Param('dir') dir: string,
                                      @Param('subDir') subDir: string): Promise<any> {
        return this.clusterService.loadRawGatekeeperTemplate(dir, subDir, clusterId);
    }

    @Post('/opa/:clusterId/gatekeeper-constraint-templates/raw')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 201,
        schema: DELETE_CLUSTER_RESPONSE_SCHEMA
    })
    async deployRawOPAGateKeeperConstraintTemplates( @Body() rawTemplate: {template: any},
                                                     @Param('clusterId') clusterId: number): Promise<{message: string, statusCode: number}> {
        return this.clusterService.deployRawOPAGateKeeperConstraintTemplates(clusterId, rawTemplate.template);
    }

    @Get('/opa/:clusterId/:templateName/constraints')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 201,
        schema: DELETE_CLUSTER_RESPONSE_SCHEMA
    })
    async getOPAGateKeeperTemplateConstraints(@Param('clusterId') clusterId: number,
                                              @Param('templateName') templateName: string): Promise<GatekeeperConstraintDetailsDto[]> {
        return this.clusterService.gateKeeperTemplateConstraintsDetails(clusterId, templateName);
    }

    @Post('/opa/:clusterId/:templateName/constraints')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 201,
        schema: DELETE_CLUSTER_RESPONSE_SCHEMA
    })
    async createOPAGateKeeperTemplateConstraint( @Body() constraint: any,
                                                 @Param('templateName') templateName: string,
                                                 @Param('clusterId') clusterId: number): Promise<{message: string, statusCode: number}> {
        return this.clusterService.createOPAGateKeeperTemplateConstraint(constraint, templateName, clusterId );
    }

    @Put('/opa/:clusterId/:templateName/constraints')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 201,
        schema: DELETE_CLUSTER_RESPONSE_SCHEMA
    })
    async patchOPAGateKeeperTemplateConstraint( @Body() constraint: any,
                                                 @Param('templateName') templateName: string,
                                                 @Param('clusterId') clusterId: number): Promise<{message: string, statusCode: number}> {
        return this.clusterService.patchOPAGateKeeperTemplateConstraint(constraint, templateName, clusterId );
    }

    @Delete('/opa/:clusterId/gatekeeper-template-constraints/:templateName/:constraintName')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 201,
        schema: DELETE_CLUSTER_RESPONSE_SCHEMA
    })
    async destroyOPAGateKeeperTemplateConstraintByName(@Param('clusterId') clusterId: number,
                                                       @Param('templateName') templateName: string,
                                                       @Param('constraintName') constraintName: string): Promise<{message: string; statusCode: number}> {
        return this.clusterService.destroyOPAGateKeeperTemplateConstraintByName(clusterId, templateName, constraintName);
    }

    @Get('/opa/:clusterId/namespaces')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 201,
        schema: DELETE_CLUSTER_RESPONSE_SCHEMA
    })
    async getNamespacesByCluster(@Param('clusterId') clusterId: number): Promise<string[]> {
        return this.clusterService.getNamespacesByCluster(clusterId);
    }

}
