import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('password_resets', function (table) {
        table.increments('id').primary();
        table.integer('account_id').notNullable().index();
        table.string('token', 50).notNullable().index();
        table.bigInteger('generated_at').notNullable().defaultTo(knex.raw('getCurrentUnixTimestamp()'));
        table.bigInteger('expired_at').notNullable();
        table.boolean('is_used').notNullable().defaultTo(false);
    });
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
