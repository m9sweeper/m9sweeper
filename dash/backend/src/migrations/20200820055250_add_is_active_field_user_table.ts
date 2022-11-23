import { Knex } from 'knex';
export async function up(knex: Knex): Promise<any> {
    return knex.schema.alterTable('users', table => {
        table.boolean('is_active').notNullable().defaultTo(true);
    })
}
export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
