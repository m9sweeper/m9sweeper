import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('pod_images',(table: Knex.CreateTableBuilder) => {
        table.integer('pod_id')
            .references('id')
            .inTable('kubernetes_pods');

        table.integer('image_id')
            .references('id')
            .inTable('images');

        table.primary(['pod_id', 'image_id']);
    });
}


export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}

