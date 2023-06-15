import { Knex } from 'knex';
import {Authority} from '../modules/user/enum/Authority';
import {AuthorityId} from '../modules/user/enum/authority-id';


export async function up(knex: Knex): Promise<any> {
    return knex('authority_levels').insert([
        { id: AuthorityId.CRON, name: Authority.CRON },
    ]);
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
