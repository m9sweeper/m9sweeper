import { Knex } from 'knex';

export enum Authority {
    SUPER_ADMIN = 'SUPER_ADMIN',
    ADMIN = 'ADMIN',
    READ_ONLY = 'READ_ONLY'
}

export async function up(knex: Knex): Promise<any> {
    return knex('authority_levels').insert([
        {id: 1, name: Authority.SUPER_ADMIN},
        {id: 2, name: Authority.ADMIN},
        {id: 3, name: Authority.READ_ONLY}
    ]);
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
