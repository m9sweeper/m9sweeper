import { Knex } from 'knex';
export async function up(knex: Knex): Promise<any> {
    return knex.schema.alterTable('image_scan_results', table => {
        table.boolean('encounter_error').nullable().defaultTo(true);
        table.bigInteger('started_at').nullable();
        table.bigInteger('finished_at').nullable();
    })
}
export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
