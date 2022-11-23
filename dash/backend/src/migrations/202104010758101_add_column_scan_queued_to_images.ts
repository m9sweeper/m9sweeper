import { Knex } from 'knex';
export async function up(knex: Knex): Promise<any> {
    return knex.schema.alterTable('images', table => {
        table.boolean('scan_queued').nullable().defaultTo(false);
    })
}
export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
