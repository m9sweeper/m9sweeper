import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('api_keys', (table) => {
        table.increments('id').primary();
        table.integer('user_id').notNullable().unique().references('id')
            .inTable('users');
        table.string('name', 100).notNullable();
        table.text('api').notNullable().unique();
        table.boolean('is_active').notNullable().defaultTo(true);
        table.bigInteger('created_at').notNullable().defaultTo(knex.raw('getCurrentUnixTimestamp() * 1000'));
        table.bigInteger('updated_at').nullable();
        table.bigInteger('deleted_at').nullable();
    });
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
