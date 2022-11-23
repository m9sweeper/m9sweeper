import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    await knex.schema.alterTable('kubernetes_namespaces', table => {
        table.integer('cluster_id').nullable().defaultTo(1);
    });
    await knex.schema.alterTable('kubernetes_deployments', table => {
        table.integer('cluster_id').nullable().defaultTo(1);
    });
    await knex.schema.alterTable('kubernetes_images', table => {
        table.integer('cluster_id').nullable().defaultTo(1);
    });
    await knex.schema.alterTable('kubernetes_pods', table => {
        table.integer('cluster_id').nullable().defaultTo(1);
    });
}
export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
