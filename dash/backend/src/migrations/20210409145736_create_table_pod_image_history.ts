import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('history_pod_images',(table: Knex.CreateTableBuilder) => {
        table.integer('history_pod_id')
            .references('id')
            .inTable('history_kubernetes_pods');

        // References actual images table, not image history table
        table.integer('image_id')
            .references('id')
            .inTable('images');

        table.primary(['history_pod_id', 'image_id']);
    });
}


export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}

