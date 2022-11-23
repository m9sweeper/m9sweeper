import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('history_kubernetes_namespaces', table => {
        table.increments('id').primary();
        table.string('name', 255).notNullable();
        table.string('self_link', 255).nullable();
        table.string('uid', 255).nullable();
        table.string('resource_version', 255).nullable();
        table.string('creation_timestamp', 255).notNullable();
        table.boolean('compliant').notNullable();
        table.integer('cluster_id').nullable();
        table.bigInteger('saved_date').notNullable().defaultTo(knex.raw('(getCurrentUnixTimestamp() - 120) * 1000'));
    });
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
