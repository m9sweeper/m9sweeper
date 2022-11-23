import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('app_settings', table => {
        table.increments('id').primary();
        table.string('settings_id').nullable().index();
        table.string('name').nullable().index();
        table.string('value').nullable();
        table.bigInteger('created_at').notNullable().defaultTo(knex.raw('getCurrentUnixTimestamp() * 1000'));
        table.integer('created_by').notNullable();
        table.bigInteger('updated_at').nullable();
        table.integer('updated_by').nullable();

        table.unique(['settings_id', 'name']);
    });
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
