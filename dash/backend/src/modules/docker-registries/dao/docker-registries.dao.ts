import {Injectable} from '@nestjs/common';
import {DatabaseService} from '../../shared/services/database.service';
import * as knexnest from 'knexnest';
import {instanceToPlain, plainToInstance} from 'class-transformer';
import {DockerRegistriesDto} from '../dto/docker-registries-dto';

@Injectable()
export class DockerRegistriesDao {
    constructor(
        private readonly databaseService: DatabaseService,
        ) {}

    async createDockerRegistry(dockerRegistry: DockerRegistriesDto): Promise<number> {
        const knex = await this.databaseService.getConnection();
        let aliases: string[];
        if (dockerRegistry.aliases) {
            if(dockerRegistry.aliases.length) {
                aliases = dockerRegistry.aliases;
            }
            delete dockerRegistry.aliases;
        }
        return knex.transaction(async transaction => {
            const createdRegistryId: number = await transaction
                .into('docker_registries')
                .insert(instanceToPlain(dockerRegistry))
                .returning('id')
                .then(results => !!results ? results[0]?.id : null);
            if (aliases) {
                await transaction
                    .into('docker_registry_aliases')
                    .insert(aliases.map(alias => {
                        return {docker_registry_id: createdRegistryId, alias};
                    }));
            }
            return createdRegistryId;
        });
    }

    /** Get the IDs of all docker registries which match any of the search options provided. Used primarily
     * to check whether names or hostnames/aliases are already in use by existing registries.
     *
     * Use idToExclude when updating a registry to check all registries except the one being updated. */
    async getDockerRegistryIds(options: {name?: string, urls?: string[], idToExclude?: number})
        : Promise<DockerRegistriesDto[]>{
      const knex = await this.databaseService.getConnection();
      const query = knex
          .select('dr.id')
          .from('docker_registries as dr')
          .where('dr.deleted_at', null)
          .leftJoin('docker_registry_aliases as ra', 'ra.docker_registry_id', 'dr.id')
          .groupBy('dr.id')
          .andWhere((builder) => {
              if (options?.name) {
                  builder.orWhere('dr.name', options.name);
              }
              if (options?.urls && options.urls.length > 0) {
                  builder.orWhereIn('dr.hostname', options.urls);
                  builder.orWhereIn('ra.alias', options.urls);
              }
          });
      if (options?.idToExclude) {
          query.andWhereNot('dr.id', options.idToExclude);
      }
      return query.then(data => data);
  }

    async getDockerRegistries(searchOptions?: {page?: number, limit?: number, sortField?: string,
            sortDirection?: string, loginRequired?: string, authType?: string, url?: string}): Promise<DockerRegistriesDto[]> {
        const knex = await this.databaseService.getConnection();

        const sql = knex
            .select([
                'd.id as _id',
                'd.name as _name',
                'd.hostname as _hostname',
                'd.login_required as _loginRequired',
                'd.username as _username',
                'd.password as _password',
                'd.auth_type as _authType',
                'd.auth_details as _authDetails',
                knex.raw('array_remove(array_agg(ra.alias), NULL) as _aliases')
            ])
            .from('docker_registries AS d')
            .leftOuterJoin('docker_registry_aliases as ra', 'ra.docker_registry_id', 'd.id')
            .where('deleted_at', null)
            .groupBy('d.id');

        if (searchOptions?.loginRequired) {
            sql.andWhere('d.login_required', searchOptions.loginRequired);
        }
        if (searchOptions?.authType) {
            sql.andWhere('d.auth_type', searchOptions.authType);
        }
        if(searchOptions?.url) {
            sql.andWhere(function() {
                this.where('d.hostname', searchOptions.url).orWhere('ra.alias', searchOptions.url);
            });
        }
        if (searchOptions?.sortField && ['id', 'name', 'hostname'].includes(searchOptions.sortField)) {
            sql.orderBy([{
                column: 'd.' + searchOptions.sortField,
                order: searchOptions?.sortDirection ? searchOptions.sortDirection : 'asc'
            }]);
        }
        if (!searchOptions?.sortField || searchOptions?.sortField !== 'id') {
            sql.orderBy('d.id');
        }
        if (searchOptions?.limit) {
            sql.limit(searchOptions.limit);
            if (searchOptions?.page) {
                sql.offset(searchOptions.page * searchOptions.limit);
            }
        }

        return knexnest(sql).then(result => plainToInstance(DockerRegistriesDto, result));
    }

    async countTotalRegistries(): Promise<number>{
        const knex = await this.databaseService.getConnection();
        const result = await knex('docker_registries as d')
            .count('d.id', {as: 'count'}).where('deleted_at', null)
            .returning('count');
        return (result && result[0] && result[0].count) ? result[0].count : 0;
    }

    async getDockerRegistryById(id: number): Promise<DockerRegistriesDto> {
        const knex = await this.databaseService.getConnection();
        return knexnest(knex
            .select(['d.id as _id',
                'd.name as _name',
                'd.hostname as _hostname',
                'd.login_required as _loginRequired',
                'd.username as _username',
                'd.password as _password',
                'd.auth_type as _authType',
                'd.auth_details as _authDetails',
                knex.raw('array_remove(array_agg(ra.alias), NULL) as _aliases')
            ])
            .from('docker_registries AS d')
            .where( 'd.id', id)
            .andWhere('d.deleted_at', null)
            .leftJoin('docker_registry_aliases AS ra', 'ra.docker_registry_id', 'd.id')
            .groupBy('d.id')
            .orderBy('d.id', 'desc'))
            .then(result => plainToInstance(DockerRegistriesDto, result[0]));
    }

    async updateDockerRegistry(dockerRegistry: DockerRegistriesDto, id: number): Promise<number> {
        const knex = await this.databaseService.getConnection();
        let aliases: string[] = [];
        if (dockerRegistry.aliases) {
            aliases = dockerRegistry.aliases;
            delete dockerRegistry.aliases;
        }
        const dockerRegistryToPlain = instanceToPlain(dockerRegistry);
        return knex.transaction(async transaction => {
            const modifiedId = await knexnest(transaction
                .where('id', +id)
                .update(dockerRegistryToPlain, ['id'])
                .into('docker_registries'))
                .then(response => response.id);
            await transaction
                .into('docker_registry_aliases')
                .where('docker_registry_id', id)
                .whereNotIn('alias', aliases)
                .del();
            if (aliases.length > 0) {
                await transaction
                    .into('docker_registry_aliases')
                    .insert(aliases.map(alias => {
                        return {docker_registry_id: id, alias};
                    }))
                    .onConflict('alias')
                    .ignore();
            }
            return modifiedId;
        });
    }

    async deleteDockerRegistryById(id: number): Promise<number> {
        const deletedTime = {
            deleted_at: Math.round(( new Date()).getTime())
        };
        const knex = await this.databaseService.getConnection();
        return knex.transaction(async transaction => {
            const returnedId: number = await transaction
                .into('docker_registries')
                .update(deletedTime)
                .where('id', id)
                .returning('id')
                .then(response => response[0].id);
            await transaction
                .into('docker_registry_aliases')
                .where('docker_registry_id', id)
                .del();
            return returnedId;
        });
    }
}
