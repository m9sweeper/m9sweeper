import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('tags', table => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.integer('group_id').nullable();
        table.bigInteger('created_at').notNullable().defaultTo(knex.raw('getCurrentUnixTimestamp() * 1000'));
        table.bigInteger('updated_at').nullable();
    })
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
