import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any>{
    return knex.schema.alterTable('image_scan_results', table => {
        table.dropColumn('scanner_name');
        table.dropColumn('scan_results');
        table.dropColumn('issues');
    });
}
export async function down(knex: Knex): Promise<any>{
    return Promise.resolve(true);
}
