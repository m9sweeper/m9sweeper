import { Knex } from 'knex';
export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('kube_bench', (table) => {
        table.increments('id').primary();
        table.text('uuid').notNullable();
        table.integer('cluster_id').notNullable();
        table.text('results_json').notNullable();
        table.text('results_summary').notNullable();
        table.bigInteger('created_at').defaultTo(knex.raw('getCurrentUnixTimestamp() * 1000'));
    });
}
export async function down(knex: Knex): Promise<any> {
    return knex.schema.dropTableIfExists('kube_bench');
}
