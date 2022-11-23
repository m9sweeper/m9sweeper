import { Injectable } from '@nestjs/common';
import { plainToInstance, instanceToPlain } from 'class-transformer';
import * as knexnest from 'knexnest';
import { DatabaseService } from '../../shared/services/database.service';
import { ScannerDto } from '../dto/scanner-dto';

@Injectable()
export class ScannerDao {
    constructor(private databaseService: DatabaseService) {}

    async getAllScanners(): Promise<ScannerDto[]>{
        const knex = await this.databaseService.getConnection();
        return knexnest(knex
            .select([
                's.id as _id',
                's.name as _name',
                's.type as _type',
                's.enabled as _enabled',
                's.required as _required',
                's.policy_id as _policyId',
                's.description as _description'
            ])
            .from('scanners as s')
            .where({
                's.deleted_at': null
            })
            .orderBy('s.id', 'desc'))
            .then( scanners => plainToInstance(ScannerDto, scanners));
    }

    async getScannerById(id: number): Promise<ScannerDto> {
        const knex = await this.databaseService.getConnection();
        return  knexnest(knex
            .select([
                's.id as _id',
                's.name as _name',
                's.description as _description',
                's.type as _type',
                's.policy_id as _policyId',
                's.enabled as _enabled',
                's.required as _required'
            ])
            .from('scanners as s')
            .where({
                    's.id': id,
                    's.deleted_at': null
            }))
            .then(scanner => plainToInstance(ScannerDto, scanner)[0]);
    }

    async createScanner(scanner: ScannerDto): Promise<number> {
        const knex = await this.databaseService.getConnection();
        return knex
            .insert(instanceToPlain(scanner))
            .into('scanners')
            .returning('id')
            .then(results => !!results ? results[0]?.id : null);
    }

    async getScannerDetails(searchClause: any, id: number): Promise<any>{
        const knex = await this.databaseService.getConnection();
        const query = knex.select('name').from('scanners');
            if(searchClause){
                query.where(searchClause);
            }
            if(id){
                query.whereNot('id', +id);
            }
            return await query.then(data=>data);
    }

    async updateScanner(scanner: ScannerDto, id: number): Promise<number> {
        const knex = await this.databaseService.getConnection();
        return knexnest(knex.where('id', +id).update(instanceToPlain(scanner), ['id']).into('scanners')).then(data => data.id);
    }

    async getScannersByPolicyId(policyId: number): Promise<ScannerDto[]> {
        const knex = await this.databaseService.getConnection();
        return knexnest(knex
            .select([
                's.id as _id',
                's.name as _name',
                's.description as _description',
                's.type as _type',
                's.enabled as _enabled',
                's.required as _required',
                's.policy_id as _policyId',
                's.vulnerability_settings as _vulnerabilitySettings'
            ])
            .from('scanners as s')
            .where({
                's.policy_id': policyId,
                's.deleted_at': null
            })
            .orderBy('s.id', 'desc'))
            .then(scanners => plainToInstance(ScannerDto, scanners));
    }

    async deleteScannerById(id: number): Promise<{id: number}[]>{
        const deletedTime: { deleted_at: number; enabled: boolean } = {
            deleted_at: Math.round(( new Date()).getTime()),
            enabled: false
        };
        const knex = await this.databaseService.getConnection();
        return knex.where('id', +id).update(deletedTime, ['id']).into('scanners')
    }

}
