import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.alterTable('image_scan_results_issues', table => {
        table.text('description').nullable().alter();
    });
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
