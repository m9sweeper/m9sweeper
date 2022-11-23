import { Knex } from 'knex';
export async function up(knex: Knex): Promise<any> {
    return knex.schema.hasColumn('history_kubernetes_clusters', 'api_key').then((exist) => {
        if (exist) {
            return knex.schema.alterTable('history_kubernetes_clusters', table => {
                table.dropColumn('api_key');
            });
        }
    });
}
export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
