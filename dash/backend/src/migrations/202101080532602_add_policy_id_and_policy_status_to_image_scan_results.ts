import { Knex } from 'knex';
export async function up(knex: Knex): Promise<any> {
    return knex.schema.alterTable('image_scan_results', table => {
        table.integer('policy_id').nullable();
        table.boolean('policy_status').nullable();
    })
}
export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
