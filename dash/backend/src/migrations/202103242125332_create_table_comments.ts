import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('comments', (table) => {
        table.increments('id').primary();
        table.text('content').notNullable();
        table.integer('exception_id').notNullable();
        table.integer('user_id').notNullable();
        table.boolean('allow_to_be_displayed').defaultTo(true);
        table.bigInteger('updated_at').nullable();
        table.bigInteger('created_at').defaultTo(knex.raw('getCurrentUnixTimestamp() * 1000'));
    });
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
