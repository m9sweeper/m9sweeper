import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.alterTable('history_kubernetes_clusters', table => {
        table.text('ip_address').notNullable().alter();
    });
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
