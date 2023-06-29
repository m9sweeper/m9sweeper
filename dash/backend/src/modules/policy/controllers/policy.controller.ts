import {ApiBearerAuth, ApiResponse, ApiSecurity, ApiTags} from '@nestjs/swagger';
import {
    Body,
    Controller,
    Delete,
    Get, HttpException, HttpStatus,
    Inject,
    Param,
    Post,
    Put, Query,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { ResponseTransformerInterceptor } from '../../../interceptors/response-transformer.interceptor';
import { PolicyService } from '../services/policy-service';
import { ScannerService } from '../../scanner/services/scanner.service';
import { ClusterService } from "../../cluster/services/cluster.service";
import {PoliciesByClusterIdDto, PoliciesIdByCluster, PolicyDto, PolicyScannerDto} from '../dto/policy-dto';
import { POLICY_RESPONSE_SCHEMA,
        CREATE_POLICY_RESPONSE_SCHEMA,
        DELETE_POLICY_RESPONSE_SCHEMA} from '../open-api-schema/policy-schema';
import { UserProfileDto } from '../../user/dto/user-profile-dto';
import { AllowedAuthorityLevels } from '../../../decorators/allowed-authority-levels.decorator'
import { AuthorityGuard } from '../../../guards/authority.guard';
import { AuthGuard } from '../../../guards/auth.guard';
import { Authority } from '../../user/enum/Authority';
import {PoliciesByClusterResponse} from '../open-api-schema/policy-by-cluster.schema';
import {POLICY_ID_BY_CLUSTER_RESPONSE_SCHEMA} from '../open-api-schema/policiesid-by-cluster.schema';
import {AuditLogInterceptor} from "../../../interceptors/audit-log.interceptor";

@ApiTags('Policies')
@ApiBearerAuth('jwt-auth')
@Controller()
@UseInterceptors(ResponseTransformerInterceptor)
export class PolicyController {
    constructor(@Inject('LOGGED_IN_USER') private readonly _loggedInUser: UserProfileDto,
                private readonly policyService: PolicyService, private readonly scannerService: ScannerService,
                private readonly clusterService: ClusterService) {}

    @Get(':policyId')
    @AllowedAuthorityLevels(Authority.READ_ONLY, Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: POLICY_RESPONSE_SCHEMA
    })
    async getPolicyById(@Param('policyId') policyId: number): Promise<PolicyDto> {
        return await this.policyService.getPolicyById(policyId);
    }

    @Get()
    @AllowedAuthorityLevels(Authority.READ_ONLY, Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: POLICY_RESPONSE_SCHEMA
    })
    async getAllPolicies(@Query('sort') sort: {field: string; direction: string; },
                         @Query('page') page: number, @Query('limit') limit: number):
        Promise<{totalCount: number, list: PolicyDto[]}> {
        return await this.policyService.getAllPolicies(page, limit, sort);
    }

    @Post()
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: CREATE_POLICY_RESPONSE_SCHEMA
    })
    @UseInterceptors(AuditLogInterceptor)
    async createPolicy(@Body() policyData: PolicyScannerDto): Promise<PolicyDto> {
        if (!this.policyService.validateActivePolicyScanners(policyData.policy, policyData.scanners)) {
            throw new HttpException({status: HttpStatus.UNPROCESSABLE_ENTITY,
                message: 'Active policies require at least one active scanner'},
                HttpStatus.UNPROCESSABLE_ENTITY)
        }
        const createdPolicy: PolicyDto = await this.policyService.createPolicy(policyData.policy);
        if (createdPolicy) {
            createdPolicy.metadata = await this.policyService.calculatePolicyMetadata(null, createdPolicy);
            if (policyData.scanners && policyData.scanners.length > 0) {
                await Promise.all(policyData.scanners.map(scanner => {
                    scanner.policyId = createdPolicy.id;
                    return this.scannerService.createScanner(scanner)
                }));
            }
            if (createdPolicy.relevantForAllClusters) {
                const clusters = await this.clusterService.getAllClusters();
                await Promise.all(clusters.map(c => this.policyService.mapClusterWithPolicy(c.id, createdPolicy.id, this._loggedInUser)));
            } else {
                if (policyData.clusters && policyData.clusters.length > 0) {
                    await Promise.all(policyData.clusters.map(c => this.policyService.mapClusterWithPolicy(c, createdPolicy.id, this._loggedInUser)));
                }
            }
            return createdPolicy;
        } else {
            throw new HttpException({ status: HttpStatus.CONFLICT, message: 'Policy Name already exists', entityType: 'Policy'}, HttpStatus.CONFLICT)
        }
    }

    @Put(':policyId')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: CREATE_POLICY_RESPONSE_SCHEMA
    })
    @UseInterceptors(AuditLogInterceptor)
    async updatePolicy(@Body() policyData: PolicyScannerDto, @Param('policyId') policyId: number): Promise<PolicyDto> {
        if (!this.policyService.validateActivePolicyScanners(policyData.policy, policyData.scanners)) {
            throw new HttpException({status: HttpStatus.UNPROCESSABLE_ENTITY,
                message: 'Active policies require at least one active scanner'},
                HttpStatus.UNPROCESSABLE_ENTITY)
        }
        const currentPolicy = await this.getPolicyById(policyId);

        if (policyData.policy.rescanEnabled == false) {
            policyData.policy.rescanGracePeriod = 0;
        }

        if (policyData.policy.tempExceptionEnabled == false) {
            policyData.policy.newScanGracePeriod = 0;
        }

        const updatedPolicy: PolicyDto = await this.policyService.updatePolicy(policyData.policy, policyId);
        updatedPolicy.metadata = await this.policyService.calculatePolicyMetadata(currentPolicy, updatedPolicy);

        if (policyData.policy.relevantForAllClusters) {
            if (currentPolicy.relevantForAllClusters) {
                return updatedPolicy;
            } else {
                const existingPolicyCLusterMap = await this.policyService.getPolicyClusterMap(policyId);
                const existingClusterIds: number[] = existingPolicyCLusterMap.map(pc => pc.id);
                const clusters = await this.clusterService.getAllClusters();
                const newClustersToBeCreated = clusters.filter(c => existingClusterIds.indexOf(c.id) == -1);
                await Promise.all(newClustersToBeCreated.map(c => this.policyService.mapClusterWithPolicy(c.id, policyId, this._loggedInUser)));
            }
        } else {
            if (policyData.clusters) {
                const existingPolicyCLusterMap = await this.policyService.getPolicyClusterMap(policyId);
                const existingClusterIds: number[] = existingPolicyCLusterMap.map(epcm => epcm.id);
                const newClusterIds = policyData.clusters.filter(c => existingClusterIds.indexOf(c) === -1);
                const clusterIdsToDelete = existingClusterIds.filter(ec => policyData.clusters.indexOf(ec) === -1);
                await Promise.all(newClusterIds.map(c => this.policyService.mapClusterWithPolicy(c, policyId, this._loggedInUser)));
                await Promise.all(clusterIdsToDelete.map(c => this.policyService.deletePolicyClusterMap(c, policyId, this._loggedInUser)));
            }
        }
        return updatedPolicy;
    }

    @Get(':policyId/clusters')
    @AllowedAuthorityLevels(Authority.READ_ONLY, Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: POLICY_ID_BY_CLUSTER_RESPONSE_SCHEMA
    })
    async getAllClustersByPolicyId(@Param('policyId') policyId: number): Promise<PoliciesIdByCluster[]> {
        return await this.policyService.getPolicyClusterMap(policyId);
    }

    @ApiTags('M9Sweeper')
    @ApiSecurity('x-auth-token')
    @ApiResponse({
        status: 200,
        type: PoliciesByClusterResponse
    })
    @Get('by-cluster/:clusterId')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN, Authority.TRAWLER)
    @UseGuards(AuthGuard, AuthorityGuard)
    async getPoliciesByClusterId(@Param('clusterId') clusterId: number): Promise<PoliciesByClusterIdDto[]> {
        return this.policyService.getPoliciesByClusterAndGlobal(clusterId);
    }

    @Delete(':id')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: DELETE_POLICY_RESPONSE_SCHEMA
    })
    @UseInterceptors(AuditLogInterceptor)
    async deletePolicyById(@Param('id') id: number): Promise<{ id: number, metadata: any }>{
        const currentPolicy = await this.policyService.getPolicyById(id);
        const deletedPolicyId =  await this.policyService.deletePolicyById(id);
        const metadata = await this.policyService.calculatePolicyMetadata(currentPolicy, null);
        return {id: deletedPolicyId, metadata};
    }
}
