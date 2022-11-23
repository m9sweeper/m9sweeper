import { Knex } from 'knex';

export enum Authority {
    KUBEHUNTER = 'KUBEHUNTER',
    KUBEBENCH = 'KUBEBENCH',
    TRAWLER = 'TRAWLER',
}

export async function up(knex: Knex): Promise<any> {
    return knex('authority_levels').insert([
        {id: 4, name: Authority.KUBEHUNTER},
        {id: 5, name: Authority.KUBEBENCH},
        {id: 6, name: Authority.TRAWLER},
    ]);
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
