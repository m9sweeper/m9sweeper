import { Knex } from 'knex';
export async function up(knex: Knex): Promise<any> {
    await knex.schema.alterTable('images', table => {
        table.string('tag', 128).alter();
        table.string('name', 1000).alter();
        table.string('url', 1000).alter();
    });
    await knex.schema.alterTable('history_kubernetes_images', table => {
        table.string('name', 3000).alter();
        table.string('image', 3000).alter();
    });
    await knex.schema.alterTable('kubernetes_images', table => {
        table.string('name', 3000).alter();
        table.string('image', 3000).alter();
    });
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
