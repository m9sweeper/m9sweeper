import { Knex } from 'knex';
export async function up(knex: Knex): Promise<any> {
    return knex.schema.alterTable('history_kubernetes_images', table => {
        table.string('image_hash', 1000).notNullable().defaultTo('');
    })
}
export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
