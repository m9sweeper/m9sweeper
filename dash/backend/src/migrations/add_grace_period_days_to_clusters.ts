import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any>{
    return knex.schema.alterTable('clusters', table => {
        table.integer('grace_period_days').nullable().defaultTo(0);
    });
}
export async function down(knex: Knex): Promise<any>{
    return Promise.resolve(true);
}
