import {Injectable} from '@nestjs/common';
import { DatabaseService } from '../../shared/services/database.service';
import {instanceToPlain, plainToInstance} from 'class-transformer';
import * as knexnest from 'knexnest';
import {PoliciesByClusterIdDto, PoliciesIdByCluster, PolicyDto} from '../dto/policy-dto';
import { UserProfileDto } from '../../user/dto/user-profile-dto';

@Injectable()
export class PolicyDao {
    constructor(private databaseService: DatabaseService) {}

    async getAllPolicies(page = 0, limit = 10, sort: {field: string; direction: string; } = {field: 'id', direction: 'asc'}):
        Promise<PolicyDto[]> {
        const knex = await this.databaseService.getConnection();

        const sortFieldMap = {
            'id': 'p.id',
            'name': 'p.name',
            'description': 'p.description',
            'new_scan_grace_period': '"_newScanGracePeriod"',
            'rescan_grace_period': '"_rescanGracePeriod"'
        };

        sort.field = sortFieldMap[sort.field] !== undefined ? sortFieldMap[sort.field] : sortFieldMap['id'];
        sort.direction = sort.direction === 'desc' ? 'desc' : 'asc';
        return knexnest(knex.select([
                'p.id as _id', 'p.name as _name', 'p.description as _description', 'p.enabled as _enabled', 'p.enforcement as _enforcement',
                knex.raw('COALESCE(p.new_scan_grace_period, 0) as "_newScanGracePeriod"'),
                knex.raw('COALESCE(p.rescan_grace_period, 0) as "_rescanGracePeriod"')
            ]).from('policies as p')
            .where({'p.deleted_at': null})
            .limit(limit).offset(page * limit)
            .orderByRaw(`${sort.field} ${sort.direction}`))
            .then(policies => plainToInstance(PolicyDto, policies));
    }

    async countAllPolicies(): Promise<number>{
        const knex = await this.databaseService.getConnection();
        const result = await knex('policies as p')
            .count('p.id', {as: 'count'}).where('deleted_at', null)
            .returning('count');
        return (result && result[0] && result[0].count) ? result[0].count : 0;
    }

    async getPolicyById(id: number): Promise<PolicyDto> {
        const knex = await this.databaseService.getConnection();
        return knexnest(knex
            .select([
                'p.id as _id','p.description as _description',
                'p.name as _name', 'p.enabled as _enabled',
                'p.enforcement as _enforcement',
                'p.relevant_for_all_clusters as _relevantForAllClusters',
                knex.raw('COALESCE(p.new_scan_grace_period, 0) as "_newScanGracePeriod"'),
                knex.raw('COALESCE(p.rescan_grace_period, 0) as "_rescanGracePeriod"')
            ])
            .from('policies as p')
            .where({'p.id': id, 'p.deleted_at': null}))
            .then( policy => plainToInstance(PolicyDto, policy)[0]);
    }

    async getPolicyByName(name: string): Promise<PolicyDto[]> {
        const knex = await this.databaseService.getConnection();
        return knexnest(knex
            .select([
                'p.id as _id','p.description as _description',
                knex.raw('COALESCE(p.new_scan_grace_period, 0) as "_newScanGracePeriod"'),
                knex.raw('COALESCE(p.rescan_grace_period, 0) as "_rescanGracePeriod"'),
                'p.name as _name', 'p.enabled as _enabled',
                'p.enforcement as _enforcement'
            ])
            .from('policies as p')
            .where({'p.name': name, 'p.deleted_at': null}))
            .then(policy => plainToInstance(PolicyDto, policy));
    }

    async createPolicy(policy: PolicyDto): Promise<number[]> {
        const knex = await this.databaseService.getConnection();
        return knex.insert(instanceToPlain(policy))
          .into('policies').returning('id').then(results => !!results ? results.map(r => r?.id) : [])
    }

    async getPolicyDetailsByPolicyName(searchClause: any, id?: number): Promise<any>{
        const knex = await this.databaseService.getConnection();
        const query =  knex.select('name')
            .from('policies')
            .where('deleted_at', null)

        if(searchClause) {
            query.where(searchClause);
        }
        if(id){
        query.whereNot('id', +id);
        }
        return query
            .then(data => data);
    }

    async updatePolicy(policy: PolicyDto, id: number): Promise<number> {
        const knex = await this.databaseService.getConnection();
        const policyToPlain = instanceToPlain(policy);
        return knexnest(knex
            .where('id', +id)
            .update(policyToPlain, ['id'])
            .into('policies'))
            .then(data => data.id);
    }

    async createPolicyClusterMap(clusterId: number, policyId: number, loggedInUser: UserProfileDto): Promise<any> {
        const knex = await this.databaseService.getConnection();
        return knex.insert({cluster_id: clusterId, policy_id: policyId, active: true, created_by: loggedInUser.id ?? 0})
          .into('policy_cluster').returning('id').then(results => !!results ? results[0]?.id : null);
    }

    async removePolicyClusterMap(clusterId: number, policyId: number, loggedInUser: UserProfileDto): Promise<any> {
        const knex = await this.databaseService.getConnection();
        return knex.update({
                active: false,
                updated_by: loggedInUser.id ?? 0,
                updated_at: knex.raw('getCurrentUnixTimestamp() * 1000')
            }).into('policy_cluster').where({cluster_id: clusterId, policy_id: policyId});
    }

    async loadPolicyClusterMap(policyId: number, activeOnly: boolean): Promise<PoliciesIdByCluster[]> {
        const knex = await this.databaseService.getConnection();
        return knex.select([
            'c.id AS id', 'c.name AS name', 'cg.id AS groupId'
        ])
        .from('policy_cluster')
        .innerJoin('clusters AS c', function () {
            this.on('c.id', '=', 'policy_cluster.cluster_id')
        })
        .innerJoin('cluster_group AS cg', function () {
            this.on('cg.id', '=', 'c.group_id')
        })
        .where({policy_id: policyId, ...(activeOnly ? {active: true} : undefined)});
    }

    async loadPoliciesOfCluster(clusterId: number): Promise<PoliciesByClusterIdDto[]> {
        const knex = await this.databaseService.getConnection();
        return knexnest(knex.select('p.id AS _id', 'p.name AS _name',
            'p.enabled AS _enabled', 'p.enforcement AS _enforcement',
            knex.raw('COALESCE(p.new_scan_grace_period, 0) as "_newScanGracePeriod"'),
            knex.raw('COALESCE(p.rescan_grace_period, 0) as "_rescanGracePeriod"'),
            's.id AS _scanners__id', 's.name AS _scanners__name', 's.type AS _scanners__type',
            's.enabled AS _scanners__enabled', 's.required AS _scanners__required', 's.vulnerability_settings AS _scanners__vulnerabilitySettings')
            .from('policies AS p')
            .leftJoin('scanners AS s', function () {
                this.on('p.id', '=', 's.policy_id').andOn('s.enabled', '=', knex.raw(true)).andOn(knex.raw('s.deleted_at is null'));
            })
            .leftJoin('policy_cluster AS pc', function () {
                this.on('pc.policy_id', '=', 'p.id').andOn('pc.active', '=', knex.raw(true));
            })
            .where({'pc.cluster_id': clusterId, 'p.enabled': true, 'p.deleted_at': null, 'p.relevant_for_all_clusters': false}));
    }

    async loadGlobalPolicies(): Promise<PoliciesByClusterIdDto[]> {
        const knex = await this.databaseService.getConnection();
        return knexnest(knex.select('p.id AS _id', 'p.name AS _name',
            'p.enabled AS _enabled', 'p.enforcement AS _enforcement',
            knex.raw('COALESCE(p.new_scan_grace_period, 0) as "_newScanGracePeriod"'),
            knex.raw('COALESCE(p.rescan_grace_period, 0) as "_rescanGracePeriod"'),
            's.id AS _scanners__id', 's.name AS _scanners__name', 's.type AS _scanners__type',
            's.enabled AS _scanners__enabled', 's.required AS _scanners__required', 's.vulnerability_settings AS _scanners__vulnerabilitySettings')
            .from('policies AS p')
            .leftJoin('scanners AS s', function () {
                this.on('p.id', '=', 's.policy_id').andOn('s.enabled', '=', knex.raw(true)).andOn(knex.raw('s.deleted_at is null'));
            })
            .where({'p.relevant_for_all_clusters': true, 'p.enabled': true, 'p.deleted_at': null}));
    }

    async deletePolicyById(id: number): Promise<number>{
        const knex = await this.databaseService.getConnection();
        return knex.update({
            deleted_at: knex.raw('getCurrentUnixTimestamp() * 1000')
        }).into('policies').where({id: id, deleted_at: null});
    }

}

