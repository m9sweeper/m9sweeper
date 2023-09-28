import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex('authority_levels').insert([
        {id: 8, name: 'METRICS'},
    ]);
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
