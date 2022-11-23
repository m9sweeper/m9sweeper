import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('files', function (table) {
        table.bigIncrements('id').primary();
        table.string('display_filename', 250).notNullable();
        table.string('file_storage', 10).notNullable().defaultTo('local');
        table.string('file_unique_id', 250).notNullable().unique();
        table.string('file_mime_type', 100).notNullable();
        table.bigInteger('file_size').notNullable();
        table.bigInteger('created_at').notNullable().defaultTo(knex.raw('getCurrentUnixTimestamp() * 1000'));
        table.integer('created_by');
        table.bigInteger('updated_at');
        table.integer('updated_by');
        table.bigInteger('deleted_at');
    });
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
