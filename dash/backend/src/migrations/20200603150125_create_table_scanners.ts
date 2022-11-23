import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('scanners', (table) => {
        table.increments('id').primary();
        table.string('name', 255).notNullable();
        table.string('type', 255).notNullable();
        table.boolean('enabled').defaultTo(true).notNullable();
        table.boolean('required').defaultTo(true).notNullable();
        table.integer('user_id').notNullable();
        table.string('description').nullable();
        table.bigInteger('created_at').notNullable().defaultTo(knex.raw('getCurrentUnixTimestamp() * 1000'));
        table.bigInteger('updated_at').nullable();
        table.bigInteger('deleted_at').nullable();
    });
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
