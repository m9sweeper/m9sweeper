import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any>{
    return knex.schema.alterTable('clusters', table => {
        table.bigInteger('last_scanned_at').nullable().defaultTo(knex.raw('getCurrentUnixTimestamp() * 1000'));
    });
}
export async function down(knex: Knex): Promise<any>{
    return Promise.resolve(true);
}
