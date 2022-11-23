import { Knex } from 'knex';
export async function up(knex: Knex): Promise<any> {
    return knex.schema.alterTable('images', table => {
        table.index(['url', 'name', 'tag', 'docker_image_id']);
    });
}
export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
