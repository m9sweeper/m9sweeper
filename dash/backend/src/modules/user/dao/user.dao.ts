import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../shared/services/database.service';
import {UserAuthority, UserListDto, UserProfileDto} from '../dto/user-profile-dto';
import { plainToInstance } from 'class-transformer';
import * as knexnest from 'knexnest';

@Injectable()
export class UserDao {
  constructor(private readonly databaseService: DatabaseService) {}


  async listAuthorities(): Promise<UserAuthority[]> {
    const knex = await this.databaseService.getConnection();
    return knex.select(['id', 'name'])
        .from('authority_levels').then(authorities => plainToInstance(UserAuthority, authorities));
  }

  async create(data: any): Promise<number[]> {
    const userAuthorities = data.authorities;
    delete data.authorities;
    const knex = await this.databaseService.getConnection();
    return knex.transaction(async trx => {
      const createdUserIds: number[] = await trx.into('users').insert(data)
        .returning('id').then(results => !!results ? results.map(r => r?.id) : []);
      await trx.into('user_authorities').insert(userAuthorities.map(authority => {
        return {authority_id: authority.id, user_id: createdUserIds[0]};
      }));
      return createdUserIds;
    });
  }

  async update(data: any): Promise<boolean> {
    const userId = data.id;
    const userAuthorities = data.authorities;
    delete data.id;
    delete data.authorities;
    const knex = await this.databaseService.getConnection();
    return knex.transaction(async trx => {
      const updatedColumnCount = await trx('users').update(data).where({id: userId});
      if (userAuthorities.length > 0) {
        await trx('user_authorities')
            .update({active: false})
            .where({user_id: userId});
        await Promise.all(userAuthorities.map(authority => {
          const conflictArray = ['user_id', 'authority_id'];
          return trx('user_authorities')
              .insert({'user_id': userId, 'authority_id': authority.id})
              .onConflict(conflictArray).merge({
                active: true
              })
        }));
      }
      return !!updatedColumnCount;
    });
  }

  async countTotalActiveUsers(): Promise<number>{
    const knex = await this.databaseService.getConnection();
    const result = await knex('users as u')
        .count('u.id', {as: 'count'}).where(
            {
              'u.deleted_at': null
            }
            )
        .returning('count');
    return (result && result[0] && result[0].count) ? result[0].count : 0;
  }

  async getUserFailedAttemptCount(userId: number): Promise<number> {
    const knex = await this.databaseService.getConnection();
    const queryResult = await knex('users as u')
                        .select(knex.raw('count(u.id) as fail_count, al.entity_type, al.entity_id'))
                        .leftJoin('audit_logs as al', function (){
                          this.on('u.id', '=', 'al.user_id')
                        })
                        .whereRaw(` al.data::json ->> 'error' = 'Failed Login: Invalid Credentials' 
                        and  al.created_date >= extract(epoch from (now() - interval '1 hour')) * 1000
                        and al.entity_type = 'Account'
                        and al.entity_id = u.id
                        and al.organization_id =0`)
                        .andWhere( 'u.id', '=', userId)
                        .groupByRaw('al.entity_type, al.entity_id')
                        .returning('fail_count');

    return queryResult[0].fail_count;
  }

  async loadUser(
    searchClause?: any,
    page = 0,
    limit = 10,
    sort: {field: string; direction: string; } = {field: 'id', direction: 'asc'}
  ): Promise<UserProfileDto[]> {
    const knex = await this.databaseService.getConnection();
    const processedSort = structuredClone(sort);

    // note that this field map may be different from sortFieldMapOuterQuery
    const sortFieldMapInnerQuery = {
      'id': 'u.id',
      'first_name': 'u.first_name',
      'last_name': 'u.last_name',
      'email': 'u.email',
      'phone': 'COALESCE(u.phone, \'\')',  // this makes it so null entries in u.phone return empty string instead
    };
    processedSort.field = sortFieldMapInnerQuery[sort.field] !== undefined ? sortFieldMapInnerQuery[sort.field] : sortFieldMapInnerQuery['id'];
    processedSort.direction = sort.direction === 'desc' ? 'desc' : 'asc';

    // Inner query with limiting & sorting to get the users that should be included
    const userQuery = knex.select('*')
      .select([
        knex.raw("COALESCE(u.phone, '') AS \"phoneadjusted\""),
      ])
      .from('users as u')
      .where(searchClause)
      .orderByRaw(`${processedSort.field} ${processedSort.direction}`)
      .limit(limit)
      .offset(page * limit);

    // outer query needs the sorting as well so that the returned 10 stay in the correct order
    const sortFieldMapOuterQuery = {
      'id': 'u.id',
      'first_name': 'u.first_name',
      'last_name': 'u.last_name',
      'email': 'u.email',
      'phone': 'u.phone'
    };
    processedSort.field = sortFieldMapOuterQuery[sort.field] !== undefined ? sortFieldMapOuterQuery[sort.field] : sortFieldMapOuterQuery['id'];

    // Outer query joins the pre-sorted & limited user query to the authorities.
    // Doing the limit one the sub query ensures we always have the right number of users per page, and users only appear once
    // If we limited on the outer query, users with multiple authorities would count as multiple users towards the limit,
    // which would cause pages with seemingly fewer users than requested, and users who could appear on multiple pages
    const query = knex
      .from(userQuery.as('u'))
      .select([
           'u.id AS _id', 'u.first_name as _firstName', 'u.last_name as _lastName', 'u.email AS _email', 'u.phoneadjusted AS _phone', 'u.is_active as _isActive', 'u.password as _password',
           'u.source_system_id as _sourceSystem_id', 'u.source_system_type as _sourceSystem_type', 'u.source_system_user_id as _sourceSystem_uid',
           'authority_levels.id as _authorities__id', 'authority_levels.name as _authorities__name'
         ])
      .leftJoin('user_authorities as user_auth', function () {
        this.on('u.id', '=', 'user_auth.user_id').andOn('user_auth.active', '=', knex.raw('?', [true]));
      }).leftJoin('authority_levels', function () {
        this.on('user_auth.authority_id', '=', 'authority_levels.id');
      }).orderBy(processedSort.field, processedSort.direction);

    const sqlQuery = query.toSQL();
    const sqlString = query.toQuery();
    return knexnest(query).then(user => plainToInstance(UserProfileDto, user));
  }

  async loadUserByApiKey(key: string): Promise<UserProfileDto> {

    const knex = await this.databaseService.getConnection();
    const result = await knexnest(knex.select([
      'u.id AS _id', 'u.first_name as _firstName', 'u.last_name as _lastName', 'u.email AS _email', 'u.phone AS _phone', 'u.is_active as _isActive', 'u.password as _password',
      'u.source_system_id as _sourceSystem_id', 'u.source_system_type as _sourceSystem_type', 'u.source_system_user_id as _sourceSystem_uid',
      'authority_levels.id as _authorities__id', 'authority_levels.name as _authorities__type'
    ]).from('users AS u')
        .leftJoin('api_keys as ak', function() {
          this.on('ak.user_id', '=', 'u.id')
        })
        .leftJoin('user_authorities as user_auth', function () {
          this.on('u.id', '=', 'user_auth.user_id')
        })
        .leftJoin('authority_levels', function () {
          this.on('user_auth.authority_id', '=', 'authority_levels.id')
        })
        .andWhere('ak.api', '=', key)
        .andWhere('ak.is_active', '=', 'true')
        .andWhere('user_auth.active', '=', 'true'));
    return result;
  }

  async loadAllActiveUsers(): Promise<UserListDto[]> {
    const knex = await this.databaseService.getConnection();
    const query = knex.select('u.id as id',
        knex.raw(`CONCAT(u.first_name, ' ', u.last_name) as full_name`))
        .from('users as u')
        .where('u.deleted_at', null)
        .orderBy('u.id', 'desc');
    return query
        .then(data => plainToInstance(UserListDto, data));
  }
}
