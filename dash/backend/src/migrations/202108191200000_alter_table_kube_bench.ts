import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.alterTable('kube_bench', (table) => {
        table.json('results_json').alter();
        table.json('results_summary').alter();
    });
}

export async function down(knex: Knex): Promise<any> {
    return knex.schema.alterTable('kube_bench', (table) => {
        table.text('results_json').notNullable().alter();
        table.text('results_summary').notNullable().alter(); });
}
