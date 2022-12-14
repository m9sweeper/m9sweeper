import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {DatabaseService} from '../../shared/services/database.service';
import {ExceptionCreateDto} from '../dto/exceptioncreateDto';
import {ExceptionListDto} from '../dto/exceptionListDto';
import * as knexnest from 'knexnest'
import {ExceptionDto, ExceptionQueryDto} from "../dto/exception-dto";

@Injectable()
export class ExceptionsDao {
    constructor(private databaseService: DatabaseService) {}

    async createException(exception: ExceptionCreateDto, userId: number): Promise<any> {
        const startDate = new Date(exception?.startDate).toISOString();
        const endDate = exception.endDate ? new Date(exception?.endDate).toISOString() : null;

        const row = {
            title: exception.title,
            reason: exception.reason,
            issue_identifier: exception.issueIdentifier,
            status: exception.status,
            start_date: startDate,
            end_date: endDate,
            relevant_for_all_policies: (exception.policies?.length || 0) === 0,
            relevant_for_all_clusters: (exception.clusters?.length || 0) === 0,
            relevant_for_all_kubernetes_namespaces: (exception.namespaces?.length || 0) === 0,
            created_at: new Date().getTime(),
            created_by: userId,
            scanner_id: exception.scannerId || null,
            type: exception.type,
            image_match: exception.imageMatch? exception.imageMatch.trim() : null,
            is_temp_exception: exception?.isTempException ?? false,
            alternate_severity: exception.altSeverity
        }
        const knex = await this.databaseService.getConnection();
        const id = await knex.insert(row, 'id').into('exceptions')
            .then(v => v[0]?.id)
            .catch(e => {
                if (e.code === '23503') {
                    throw new HttpException({
                        status: HttpStatus.BAD_REQUEST,
                        message: 'Selected scanner does not exist',
                    }, HttpStatus.BAD_REQUEST)
                } else {
                    throw e;
                }
            });

        // Save linked policies
        if (Array.isArray(exception.policies) && exception.policies?.length) {
            const policyRows = exception.policies.map(p => {return {policy_id: p, exception_id: id }; });
            await knex.insert(policyRows).into('exceptions_policies');
        }

        // Save linked clusters
        if (exception.clusters?.length) {
            const policyRows = exception.clusters.map(c => {return {cluster_id: c, exception_id: id }; });
            await knex.insert(policyRows).into('exceptions_clusters');
        }

        // Save linked namespaces
        if (exception.namespaces?.length) {
            const namespaceRows = exception.namespaces.map(n => {return {namespace_name: n, exception_id: id }; });
            await knex.insert(namespaceRows).into('exceptions_kubernetes_namespaces');
        }
        return id;
    }

    async getAllSimpleExceptions(): Promise<ExceptionListDto[]> {
        const knex = await this.databaseService.getConnection();
        return knex.select('id',
            'title',
            knex.raw(`to_char(start_date, 'YYYY-MM-DD') AS "start_date"`),
            knex.raw(`to_char(end_date, 'YYYY-MM-DD') AS "end_date"`),
            'status')
            .from('exceptions')
            .where('deleted_at', null);
    }

    async getAllActiveExceptions(): Promise<ExceptionDto[]> {
        const knex = await this.databaseService.getConnection();
        const sql = knex.select('ex.id AS _id',
            'ex.title AS _title',
            'ex.type as _type',
            'ex.reason AS _reason',
            knex.raw(`to_char(ex.start_date, 'YYYY-MM-DD') AS "_startDate"`),
            knex.raw(`to_char(ex.end_date, 'YYYY-MM-DD') AS "_endDate"`),
            'ex.status AS _status',
            'ex.issue_identifier AS _issueIdentifier',
            'ex.relevant_for_all_policies AS _relevantForAllPolicies',
            'ex.relevant_for_all_kubernetes_namespaces AS _relevantForAllKubernetesNamespaces',
            'ex.relevant_for_all_clusters AS _relevantForAllClusters',
            'ex.image_match AS _imageMatch',
            'ex.is_temp_exception as _isTempException',
            'sc.id AS _scanner_id',
            'sc.name AS _scanner_name',
            'namespace_ex.namespace_name AS _namespaces__name',
            'pol.id AS _policies__id',
            'pol.name AS _policies__name',
            'cl.name AS _clusters__name',
            'cl.id AS _clusters__id',)
            .from('exceptions AS ex')
            .leftJoin('scanners AS sc', 'ex.scanner_id', 'sc.id')
            .leftJoin('exceptions_kubernetes_namespaces AS namespace_ex', 'namespace_ex.exception_id', 'ex.id')
            .leftJoin('exceptions_policies AS policy_ex', 'policy_ex.exception_id', 'ex.id')
            .leftJoin('policies AS pol', 'pol.id', 'policy_ex.policy_id')
            .leftJoin('exceptions_clusters AS cluster_ex', 'cluster_ex.exception_id', 'ex.id')
            .leftJoin('clusters AS cl', 'cl.id', 'cluster_ex.cluster_id')
            .where('ex.status', 'active')
            .andWhere('ex.deleted_at', null);
        return await knexnest(sql).then(data => data);
    }

    async getAllFilteredPolicyExceptions(
        clusterId: number, policyIds: number[],
        namespace: string, imageName: string
      ): Promise<ExceptionQueryDto[]> {
       return this.getAllFilteredExceptionsByTypes('policy', clusterId, policyIds, imageName, namespace);
      }

    async getAllFilteredExceptionsByTypes( type: string,
        clusterId: number, policyIds: number[],
        imageName: string,  namespace?: string
    ): Promise<ExceptionQueryDto[]> {
        const knex = await this.databaseService.getConnection();
        const today = new Date().toISOString().slice(0, 10); // @TODO: Eventually make this a utility function, perhaps with timezone/locality considered
        let sql = knex.distinct('ex.id as _id',
            'ex.issue_identifier as _issueIdentifier',
            'ex.title AS _title',
            'ex.type as _type',
            'ex.reason AS _reason',
            knex.raw(`to_char(ex.start_date, 'YYYY-MM-DD') AS "_startDate"`),
            knex.raw(`to_char(ex.end_date, 'YYYY-MM-DD') AS "_endDate"`),
            'ex.status AS _status',
            'ex.relevant_for_all_policies AS _relevantForAllPolicies',
            'ex.relevant_for_all_kubernetes_namespaces AS _relevantForAllKubernetesNamespaces',
            'ex.relevant_for_all_clusters AS _relevantForAllClusters',
            'ex.image_match AS _imageMatch',
            'ex.is_temp_exception as _isTempException',
            'exceptions_policies.policy_id AS _policyId',
            'ex.alternate_severity AS _altSeverity')
            .from('exceptions AS ex')
            .leftOuterJoin('exceptions_clusters', 'ex.id', 'exceptions_clusters.exception_id')
            .leftOuterJoin('exceptions_policies', 'ex.id', 'exceptions_policies.exception_id')
            .leftOuterJoin('exceptions_kubernetes_namespaces', 'ex.id', 'exceptions_kubernetes_namespaces.exception_id')
            .whereNull('ex.deleted_at')
            .andWhere('status', 'active')
            .andWhere('ex.type', 'like', type)
            .andWhere(function() {
                this.whereNull('ex.start_date')
                    .orWhere('ex.start_date', '<=', today);
            })
            .andWhere(function() {
                this.whereNull('ex.end_date')
                    .orWhere('ex.end_date', '>', today);
            })
            .andWhere(function() {
                let cond = this.where({
                    'ex.relevant_for_all_clusters': true
                });

                if (clusterId) {
                    cond.orWhere({
                        'exceptions_clusters.cluster_id': clusterId
                    });
                }
            })
            .andWhere(function() {
                let cond = this.where({
                    'ex.relevant_for_all_policies': true
                });

                if (policyIds) {
                    cond.orWhereIn('exceptions_policies.policy_id', policyIds);
                }
            })
            .andWhere(function() {
                let cond = this.where({
                    'ex.relevant_for_all_kubernetes_namespaces': true
                });

                if (namespace) {
                    cond.orWhere({
                        'exceptions_kubernetes_namespaces.namespace_name': namespace
                    });
                }
            })

        // if (imageName) {
        //     sql.andWhere('ex.image_match', 'like', `%${imageName}%`);
        // }

        //console.log('getAllFilteredPolicyExceptions: ', sql.toQuery());

        return await knexnest(sql).then(data => data);
    }

    async getAllFilteredOverrideExceptions(
        clusterId: number, policyIds: number[], imageName: string
    ): Promise<ExceptionQueryDto[]> {

        return this.getAllFilteredExceptionsByTypes('override', clusterId, policyIds, imageName);
    }

    async getAllCommonExceptions(): Promise<ExceptionDto[]> {
        const knex = await this.databaseService.getConnection();
        const sql = knex.select('ex.id AS _id',
            'ex.title AS _title',
            'ex.type as _type',
            'ex.reason AS _reason',
            knex.raw(`to_char(ex.start_date, 'YYYY-MM-DD') AS "_startDate"`),
            knex.raw(`to_char(ex.end_date, 'YYYY-MM-DD') AS "_endDate"`),
            'ex.status AS _status',
            'ex.issue_identifier AS _issueIdentifier',
            'ex.relevant_for_all_policies AS _relevantForAllPolicies',
            'ex.relevant_for_all_kubernetes_namespaces AS _relevantForAllKubernetesNamespaces',
            'ex.relevant_for_all_clusters AS _relevantForAllClusters',
            'ex.image_match AS _imageMatch',
            'ex.is_temp_exception as _isTempException',
            'sc.id AS _scanner_id',
            'sc.name AS _scanner_name',
            'namespace_ex.namespace_name AS _namespaces__name',
            'pol.id AS _policies__id',
            'pol.name AS _policies__name',
            'cl.name AS _clusters__name',
            'cl.id AS _clusters__id',)
            .from('exceptions AS ex')
            .leftJoin('scanners AS sc', 'ex.scanner_id', 'sc.id')
            .leftJoin('exceptions_kubernetes_namespaces AS namespace_ex', 'namespace_ex.exception_id', 'ex.id')
            .leftJoin('exceptions_policies AS policy_ex', 'policy_ex.exception_id', 'ex.id')
            .leftJoin('policies AS pol', 'pol.id', 'policy_ex.policy_id')
            .leftJoin('exceptions_clusters AS cluster_ex', 'cluster_ex.exception_id', 'ex.id')
            .leftJoin('clusters AS cl', 'cl.id', 'cluster_ex.cluster_id')
            .where('ex.status', 'active')
            .andWhere('ex.type', 'gatekeeper')
            .andWhere('ex.issue_identifier', '')
            // .andWhere('ex.relevant_for_all_clusters', true)
            .andWhere('ex.deleted_at', null);
        return await knexnest(sql).then(data => data);
    }

    async getAllCommonExceptionsWithIssueIdentifier(issueIdentifier: string): Promise<ExceptionDto[]> {
        const knex = await this.databaseService.getConnection();
        const sql = knex.select('ex.id AS _id',
            'ex.title AS _title',
            'ex.type as _type',
            'ex.reason AS _reason',
            knex.raw(`to_char(ex.start_date, 'YYYY-MM-DD') AS "_startDate"`),
            knex.raw(`to_char(ex.end_date, 'YYYY-MM-DD') AS "_endDate"`),
            'ex.status AS _status',
            'ex.issue_identifier AS _issueIdentifier',
            'ex.relevant_for_all_policies AS _relevantForAllPolicies',
            'ex.relevant_for_all_kubernetes_namespaces AS _relevantForAllKubernetesNamespaces',
            'ex.relevant_for_all_clusters AS _relevantForAllClusters',
            'ex.image_match AS _imageMatch',
            'ex.is_temp_exception as _isTempException',
            'sc.id AS _scanner_id',
            'sc.name AS _scanner_name',
            'namespace_ex.namespace_name AS _namespaces__name',
            'pol.id AS _policies__id',
            'pol.name AS _policies__name',
            'cl.name AS _clusters__name',
            'cl.id AS _clusters__id',)
            .from('exceptions AS ex')
            .leftJoin('scanners AS sc', 'ex.scanner_id', 'sc.id')
            .leftJoin('exceptions_kubernetes_namespaces AS namespace_ex', 'namespace_ex.exception_id', 'ex.id')
            .leftJoin('exceptions_policies AS policy_ex', 'policy_ex.exception_id', 'ex.id')
            .leftJoin('policies AS pol', 'pol.id', 'policy_ex.policy_id')
            .leftJoin('exceptions_clusters AS cluster_ex', 'cluster_ex.exception_id', 'ex.id')
            .leftJoin('clusters AS cl', 'cl.id', 'cluster_ex.cluster_id')
            .where('ex.status', 'active')
            .andWhere('ex.type', 'gatekeeper')
            .andWhere('ex.issue_identifier', issueIdentifier)
            // .andWhere('ex.relevant_for_all_clusters', true)
            .andWhere('ex.deleted_at', null);
        return await knexnest(sql).then(data => data);
    }

    async getExceptionsForIssueIdentifier(issueIdentifier: string, clusterId: number): Promise<ExceptionDto[]> {
        const knex = await this.databaseService.getConnection();
        const sql = knex.select('ex.id AS _id',
            'ex.title AS _title',
            'ex.type as _type',
            'ex.reason AS _reason',
            knex.raw(`to_char(ex.start_date, 'YYYY-MM-DD') AS "_startDate"`),
            knex.raw(`to_char(ex.end_date, 'YYYY-MM-DD') AS "_endDate"`),
            'ex.status AS _status',
            'ex.issue_identifier AS _issueIdentifier',
            'ex.relevant_for_all_policies AS _relevantForAllPolicies',
            'ex.relevant_for_all_kubernetes_namespaces AS _relevantForAllKubernetesNamespaces',
            'ex.relevant_for_all_clusters AS _relevantForAllClusters',
            'ex.image_match AS _imageMatch',
            'ex.is_temp_exception as _isTempException',
            'sc.id AS _scanner_id',
            'sc.name AS _scanner_name',
            'namespace_ex.namespace_name AS _namespaces__name',
            'pol.id AS _policies__id',
            'pol.name AS _policies__name',
            'cl.name AS _clusters__name',
            'cl.id AS _clusters__id',)
            .from('exceptions AS ex')
            .leftJoin('scanners AS sc', 'ex.scanner_id', 'sc.id')
            .leftJoin('exceptions_kubernetes_namespaces AS namespace_ex', 'namespace_ex.exception_id', 'ex.id')
            .leftJoin('exceptions_policies AS policy_ex', 'policy_ex.exception_id', 'ex.id')
            .leftJoin('policies AS pol', 'pol.id', 'policy_ex.policy_id')
            .leftJoin('exceptions_clusters AS cluster_ex', 'cluster_ex.exception_id', 'ex.id')
            .leftJoin('clusters AS cl', 'cl.id', 'cluster_ex.cluster_id')
            .where('ex.status', 'active')
            .andWhere('ex.type', 'gatekeeper')
            .andWhere('ex.issue_identifier', issueIdentifier)
            .andWhere('cluster_ex.cluster_id', clusterId)
            .andWhere('ex.relevant_for_all_clusters', false)
            .andWhere('ex.deleted_at', null);
        // console.log(sql.toSQL());
        return await knexnest(sql).then(data => data);
    }

    async getException(exceptionId: number): Promise<ExceptionDto[]> {
        const knex = await this.databaseService.getConnection();
        const sql = knex.select('ex.id AS _id',
            'ex.title AS _title',
            'ex.type as _type',
            'ex.reason AS _reason',
            knex.raw(`to_char(ex.start_date, 'YYYY-MM-DD') AS "_startDate"`),
            knex.raw(`to_char(ex.end_date, 'YYYY-MM-DD') AS "_endDate"`),
            'ex.status AS _status',
            'ex.issue_identifier AS _issueIdentifier',
            'ex.relevant_for_all_policies AS _relevantForAllPolicies',
            'ex.relevant_for_all_kubernetes_namespaces AS _relevantForAllKubernetesNamespaces',
            'ex.relevant_for_all_clusters AS _relevantForAllClusters',
            'ex.image_match AS _imageMatch',
            'ex.is_temp_exception as _isTempException',
            'sc.id AS _scanner_id',
            'sc.name AS _scanner_name',
            'namespace_ex.namespace_name AS _namespaces__name',
            'pol.id AS _policies__id',
            'pol.name AS _policies__name',
            'cl.name AS _clusters__name',
            'cl.id AS _clusters__id',
            'ex.alternate_severity AS _altSeverity',)
            .from('exceptions AS ex')
            .leftJoin('scanners AS sc', 'ex.scanner_id', 'sc.id')
            .leftJoin('exceptions_kubernetes_namespaces AS namespace_ex', 'namespace_ex.exception_id', 'ex.id')
            .leftJoin('exceptions_policies AS policy_ex', 'policy_ex.exception_id', 'ex.id')
            .leftJoin('policies AS pol', 'pol.id', 'policy_ex.policy_id')
            .leftJoin('exceptions_clusters AS cluster_ex', 'cluster_ex.exception_id', 'ex.id')
            .leftJoin('clusters AS cl', 'cl.id', 'cluster_ex.cluster_id')
            .where('ex.id', exceptionId)
            .andWhere('ex.deleted_at', null);
        return await knexnest(sql).then(data => data);
    }

    async deleteException(exceptionId: number, userId: number): Promise<any> {
        const now = new Date().getTime();
        const knex = await this.databaseService.getConnection();
        return knex.from('exceptions')
            .update('deleted_at', now)
            .update('deleted_by', userId)
            .where('id', exceptionId);
    }

    async updateException(exception: ExceptionCreateDto, exceptionId: number, userId: number): Promise<number> {

        const startDate = new Date(exception?.startDate).toISOString();
        const endDate = exception.endDate ? new Date(exception?.endDate).toISOString() : null;

        const updatedRow = {
            title: exception.title,
            reason: exception.reason,
            issue_identifier: exception.issueIdentifier,
            status: exception.status,
            start_date: startDate,
            end_date: endDate,
            relevant_for_all_policies: (exception.policies?.length || 0) === 0,
            relevant_for_all_clusters: (exception.clusters?.length || 0) === 0,
            relevant_for_all_kubernetes_namespaces: (exception.namespaces?.length || 0) === 0,
            updated_by: userId,
            scanner_id: exception.scannerId || null,
            type: exception.type,
            image_match: exception.imageMatch?.trim(),
            is_temp_exception: exception.isTempException || false,
            alternate_severity: exception.altSeverity
        }

        let namespaceRows = null;
        if (!updatedRow.relevant_for_all_kubernetes_namespaces) {
            namespaceRows = exception.namespaces.map(n => { return {namespace_name: n, exception_id: exceptionId}; });
        }

        let clusterRows = null;
        if (!updatedRow.relevant_for_all_clusters) {
            clusterRows = exception.clusters.map(c => { return {cluster_id: c, exception_id: exceptionId}; });
        }

        let policyRows = null;
        if (!updatedRow.relevant_for_all_policies) {
            policyRows = exception.policies.map(p => { return {policy_id: p, exception_id: exceptionId}; });
        }

        const knex = await this.databaseService.getConnection();
        return await knex.transaction(async function(trx){
            try {
                // Update the exception's main info
                await knex('exceptions').transacting(trx)
                    .update(updatedRow)
                    .where('id', exceptionId);

                // Delete the associated data from the linking tables
                await knex('exceptions_kubernetes_namespaces').transacting(trx)
                    .delete().where('exception_id', exceptionId);
                await knex('exceptions_clusters').transacting(trx)
                    .delete().where('exception_id', exceptionId);
                await knex('exceptions_policies').transacting(trx)
                    .delete().where('exception_id', exceptionId);

                // Create new versions of the associated data
                if (namespaceRows) {
                    await knex('exceptions_kubernetes_namespaces').transacting(trx).insert(namespaceRows)
                }
                if (policyRows) {
                    await knex('exceptions_policies').transacting(trx).insert(policyRows);
                }
                if (clusterRows) {
                    await knex('exceptions_clusters').transacting(trx).insert(clusterRows);
                }
                await trx.commit();
            }
            catch (e) {
                await trx.rollback();
                throw e;
            }
        }).then(_ => {
            return exceptionId;
        })
    }

    async updateExceptionStatus(exceptionId: number, status: string): Promise<number>{
        const knex = await this.databaseService.getConnection();
        return knex('exceptions')
            .update({status: status})
            .where('id', exceptionId);
    }

    /**
     * Find if a temporary exception has ever been created for the given issue in the given circumstances
     * @param clusterId
     * @param policyId
     * @param scannerId
     * @param namespace
     * @param cve
     * @param imageName
     */
    async tempExceptionCreated(
      clusterId: number, policyId: number, scannerId: number,
      namespace: string, cve: string, imageName: string
    ): Promise<boolean> {
        const knex = await this.databaseService.getConnection();
        const query = knex
          .select('exceptions.id as id', 'exceptions.issue_identifier as issue_identifier')
          .from('exceptions')
          .leftOuterJoin('exceptions_clusters', 'exceptions.id', 'exceptions_clusters.exception_id')
          .leftOuterJoin('exceptions_policies', 'exceptions.id', 'exceptions_policies.exception_id')
          .leftOuterJoin('exceptions_kubernetes_namespaces', 'exceptions.id', 'exceptions_kubernetes_namespaces.exception_id')
          .andWhere('exceptions.is_temp_exception', '=', true)
          .andWhere(function() {
              this.whereNull('exceptions.scanner_id')
                .orWhere('exceptions.scanner_id', '=', scannerId);
          })
          .andWhere(function() {
              this.where({
                  'exceptions.relevant_for_all_clusters': true
              }).orWhere({
                  'exceptions_clusters.cluster_id': clusterId
              })
          })
          .andWhere(function() {
              this.where({
                  'exceptions.relevant_for_all_policies': true
              }).orWhere({
                  'exceptions_policies.policy_id': policyId
              })
          })
          .andWhere(function() {
              this.where({
                  'exceptions.relevant_for_all_kubernetes_namespaces': true
              }).orWhere({
                  'exceptions_kubernetes_namespaces.namespace_name': namespace
              })
          })
          .andWhere(function() {
              this.where({
                  'exceptions.issue_identifier': ''
              })
              .orWhere('exceptions.issue_identifier', cve)
          })
            .andWhere(function() {
                this.whereRaw(`SELECT ? LIKE exceptions.image_match`, [imageName])
                  .orWhereNull('exceptions.image_match');
            })
            .andWhere('exceptions.deleted_at', null);
        const matchingExceptions = await query;

        return !!matchingExceptions?.length;
    }

    async getAllUsersToMail(): Promise<any> {
        const knex = await this.databaseService.getConnection();
        const query = knex
            .select([
                'u.email as _email',
                knex.raw(`CONCAT(u.first_name, ' ', u.last_name) as _fullName`)
            ])
            .from('users as u')
        // console.log(query.toSQL());
        return knexnest(query)
            .then(data => data);
    }
    async getExceptionCreatorFullName(userId: number): Promise<any> {
        const knex = await this.databaseService.getConnection();
        const query = knex
            .select(
                knex.raw(`CONCAT(u.first_name, ' ', u.last_name) as "_fullName"`)
            )
            .from('users as u')
           .where('u.id', userId)
        // console.log(query.toSQL());
        return knexnest(query)
            .then(data => {
                return data;
            });

    }

    async getAllAdminsToMail(): Promise<any> {
        // we can get the list from ENV
        const excludedEmailAddresses = ['Trawler'];
        const knex = await this.databaseService.getConnection();
        const query = knex
            .select([
                'u.email as _email',
                knex.raw(`CONCAT(u.first_name, ' ', u.last_name) as "_fullName"`)
            ])
            .from('users as u')
            .leftJoin('user_authorities as ua', function(){
                this.on('u.id','=','ua.user_id')
            })
            .whereIn('ua.authority_id', [1,2])
            .whereNotIn('u.email', excludedEmailAddresses);
        return knexnest(query)
            .then(data => {
                return data;
            });
    }

    async getExceptionsExpireTomorrow(tomorrow: string): Promise<ExceptionDto[]> {
        const knex = await this.databaseService.getConnection();
        const query = knex.select(['ex.id AS _id',
            'ex.title AS _title',
            'ex.type as _type',
            'ex.reason AS _reason',
            knex.raw(`to_char(ex.start_date, 'YYYY-MM-DD') AS "_startDate"`),
            knex.raw(`to_char(ex.end_date, 'YYYY-MM-DD') AS "_endDate"`),
            'ex.status AS _status',
            'ex.issue_identifier AS _issueIdentifier',
            'ex.relevant_for_all_policies AS _relevantForAllPolicies',
            'ex.relevant_for_all_kubernetes_namespaces AS _relevantForAllKubernetesNamespaces',
            'ex.relevant_for_all_clusters AS _relevantForAllClusters',
            'ex.image_match AS _imageMatch'])
            .from('exceptions as ex')
            .whereNull('deleted_at')
            .where('ex.status', 'active')
            .andWhere('end_date', tomorrow);

        // console.log(query.toSQL());
        return knexnest(query)
            .then(data => {
                return data;
            });

    }
}
