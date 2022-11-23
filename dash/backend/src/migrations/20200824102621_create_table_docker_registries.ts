import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('docker_registries', (table) => {
        table.increments('id').primary();
        table.string('name', 255).notNullable();
        table.text('hostname').notNullable();
        table.boolean('login_required').notNullable().defaultTo(true);
        table.string('username').nullable();
        table.string('password').nullable();
        table.bigInteger('created_at').notNullable().defaultTo(knex.raw('getCurrentUnixTimestamp() * 1000'));
        table.bigInteger('updated_at').nullable();
        table.bigInteger('deleted_at').nullable();
    })
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
