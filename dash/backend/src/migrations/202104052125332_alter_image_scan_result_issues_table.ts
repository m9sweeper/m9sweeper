import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any>{
    return knex.schema.alterTable('image_scan_results_issues', table => {
        table.string('scanner_name', 100);
    });
}
export async function down(knex: Knex): Promise<any>{
    return Promise.resolve(true);
}
