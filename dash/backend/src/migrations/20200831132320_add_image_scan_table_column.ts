import { Knex } from 'knex';
export async function up(knex: Knex): Promise<any> {
    return knex.schema.alterTable('image_scan_results', table => {
        table.string('scan_results').notNullable();
        table.integer('critical_issues').nullable();
        table.integer('major_issues').nullable();
        table.integer('medium_issues').nullable();
        table.integer('low_issues').nullable();
        table.integer('negligible_issues').nullable();
        })
}
export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
