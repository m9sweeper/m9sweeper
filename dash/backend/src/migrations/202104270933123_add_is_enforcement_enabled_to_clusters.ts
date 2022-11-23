import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any>{
    return knex.schema.alterTable('clusters', table => {
        table.boolean('is_enforcement_enabled').defaultTo(false);
    });
}
export async function down(knex: Knex): Promise<any>{
    return Promise.resolve(true);
}
