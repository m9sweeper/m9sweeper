import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    await knex.schema.alterTable('history_kubernetes_clusters', table => {
        table.bigInteger('saved_date').notNullable().alter();
    });
    await knex.schema.alterTable('history_kubernetes_namespaces', table => {
        table.bigInteger('saved_date').notNullable().alter();
    });
    await knex.schema.alterTable('history_kubernetes_deployments', table => {
        table.bigInteger('saved_date').notNullable().alter();
    });
    await knex.schema.alterTable('history_kubernetes_images', table => {
        table.bigInteger('saved_date').notNullable().alter();
    });
}
export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
