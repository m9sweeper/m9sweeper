import { Knex } from 'knex';

export enum Authority {
    FALCO = 'FALCO'
}

export async function up(knex: Knex): Promise<any> {
    return knex('authority_levels').insert([
        {id: 7, name: Authority.FALCO},
    ]);
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
