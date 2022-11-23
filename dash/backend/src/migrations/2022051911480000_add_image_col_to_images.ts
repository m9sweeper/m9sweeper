import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.alterTable('images', table => {
        table.string('image', 3000).nullable();
    }).then(() => {
        return knex.raw("update images " +
            "set image = concat(images.url, '/', images.name, ':', " +
            "case when (images.tag = '' or images.tag is null) then 'latest' else images.tag end)")
    });
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
