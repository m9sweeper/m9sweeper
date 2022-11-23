import { Knex } from 'knex';
export async function up(knex: Knex): Promise<any> {
    return knex.schema.alterTable('scanners', table => {
        table.json('vulnerability_settings').defaultTo('{}');
    })
}
export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
