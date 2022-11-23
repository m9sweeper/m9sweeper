import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.alterTable('history_kubernetes_clusters', (table: Knex.CreateTableBuilder) => {
        table.integer('cluster_id')
            .nullable()
            .references('id').inTable('clusters');
    });
}


export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}

