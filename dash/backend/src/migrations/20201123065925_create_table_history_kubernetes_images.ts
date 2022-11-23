import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('history_kubernetes_images', table => {
        table.increments('id').primary();
        table.string('name', 255).notNullable();
        table.string('image', 255).nullable();
        table.string('deployment_name', 255).nullable();
        table.string('cluster_name',255).nullable();
        table.string('namespace',255).nullable();
        table.boolean('compliant').notNullable();
        table.integer('cluster_id').nullable();
        table.bigInteger('saved_date').notNullable().defaultTo(knex.raw('(getCurrentUnixTimestamp() - 120) * 1000'));
    });
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
