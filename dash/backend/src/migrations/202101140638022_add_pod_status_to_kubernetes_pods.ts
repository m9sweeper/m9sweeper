import { Knex } from 'knex';
export async function up(knex: Knex): Promise<any> {
    return knex.schema.alterTable('kubernetes_pods', table => {
        table.string('pod_status').nullable();
    })
}
export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
