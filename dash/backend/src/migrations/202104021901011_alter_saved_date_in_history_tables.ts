import { Knex } from 'knex';
export async function up(knex: Knex): Promise<any> {
    const historyTables = [
        'history_kubernetes_clusters',
        'history_kubernetes_deployments',
        'history_kubernetes_images',
        'history_kubernetes_namespaces',
    ];
    return Promise.all(
        historyTables.map(historyTable => {
            return knex.schema.alterTable(historyTable, table => {
                table.date('temp_saved_date').nullable();
            }).then(() => {
                return knex.raw(`UPDATE ${historyTable} SET temp_saved_date = TO_TIMESTAMP(CAST(saved_date/1000 AS BIGINT))::DATE`);
            }).then(() => {
                return knex.schema.alterTable(historyTable, table => {
                    table.dropColumn('saved_date');
                });
            }).then(() => {
                return knex.schema.alterTable(historyTable, table => {
                    table.renameColumn('temp_saved_date', 'saved_date');
                });
            }).then(() => {
                return knex.schema.alterTable(historyTable, table => {
                    table.date('saved_date').notNullable().alter();
                });
            });
        })
    );
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
