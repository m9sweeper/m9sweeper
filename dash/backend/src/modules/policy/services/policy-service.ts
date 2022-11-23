import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {PoliciesByClusterIdDto, PoliciesIdByCluster, PolicyDto} from '../dto/policy-dto';
import { PolicyDao } from '../dao/policy-dao';
import { UserProfileDto } from 'src/modules/user/dto/user-profile-dto';
import {AuditLogService} from "../../audit-log/services/audit-log.service";

@Injectable()
export class PolicyService {
    private readonly entityType: string = 'Policy';
    constructor(private readonly policyDao: PolicyDao,
                private readonly auditLogService: AuditLogService) {}

    async createPolicy(policy: PolicyDto): Promise<PolicyDto> {
        const policyByName: PolicyDto[] = await this.policyDao.getPolicyByName(policy.name);
        if (policyByName === null) {
            const policyIds: number[] = await this.policyDao.createPolicy(policy);
            if (policyIds && Array.isArray(policyIds) && policyIds.length > 0) {
                return await this.policyDao.getPolicyById(policyIds[0]);
            }
        }
        return null;
    }

    async updatePolicy(policy: PolicyDto, id: number): Promise<PolicyDto> {
        const checkPolicyName = await this.policyDao.getPolicyDetailsByPolicyName({'name': policy.name}, id);
        if(checkPolicyName && checkPolicyName.length > 0){
           throw new HttpException({ status: HttpStatus.CONFLICT, message: 'Policy Name already exists', entityType: this.entityType, entityId: id}, HttpStatus.CONFLICT)
        }
        const result: number = await this.policyDao.updatePolicy(policy, id);
        return await this.getPolicyById(result);
    }

    async getPolicyById(id: number): Promise<PolicyDto> {
        return await this.policyDao.getPolicyById(id);
    }

    async getAllPolicies( page  = 0,
                          limit  = 10,
                          sort: {field: string; direction: string; } = {field: 'id', direction: 'asc'}):
        Promise<{totalCount: number, list: PolicyDto[]}> {
        const totalCount = await this.policyDao.countAllPolicies();
        const list = await this.policyDao.getAllPolicies(page, limit, sort);
        return {
            totalCount: +totalCount,
            list: list
        }
    }

    async mapClusterWithPolicy(clusterId: number, policyId: number, loggedInUser: UserProfileDto): Promise<number[]> {
        return this.policyDao.createPolicyClusterMap(clusterId, policyId, loggedInUser);
    }

    async deletePolicyClusterMap(clusterId: number, policyId: number, loggedInUser: UserProfileDto): Promise<any> {
        return await this.policyDao.removePolicyClusterMap(clusterId, policyId, loggedInUser);
    }

    async getPolicyClusterMap(policyId: number): Promise<PoliciesIdByCluster[]> {
        return await this.policyDao.loadPolicyClusterMap(policyId, true);
    }

    async getPoliciesByCluster(clusterId: number): Promise<PoliciesByClusterIdDto[]> {
        return await this.policyDao.loadPoliciesOfCluster(clusterId);
    }

    async getPoliciesByClusterAndGlobal(clusterId: number): Promise<PoliciesByClusterIdDto[]> {
        let policies: PoliciesByClusterIdDto[] = [];

        const clusterPolicies = await this.getPoliciesByCluster(clusterId);
        if (clusterPolicies) {
            policies.push(...clusterPolicies);
        }

        const globalPolicies = await this.getGlobalPolicies();
        if (globalPolicies) {
            policies.push(...globalPolicies);
        }
        
        return policies;
    }

    /**
     * Find policies with no cluster id specified
     */
    async getGlobalPolicies(): Promise<PoliciesByClusterIdDto[]> {
        return await this.policyDao.loadGlobalPolicies();
    }

    async deletePolicyById(id: number): Promise<number>{
        return await this.policyDao.deletePolicyById(id);
    }

    async calculatePolicyMetadata(previous: PolicyDto, updated: PolicyDto): Promise<any> {
        return await this.auditLogService.calculateMetaData(previous, updated, 'Policy');
    }

}

