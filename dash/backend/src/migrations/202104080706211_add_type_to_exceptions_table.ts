import { Knex } from 'knex';
export async function up(knex: Knex): Promise<any> {
    return knex.schema.alterTable('exceptions', table => {
        table.string('type').notNullable().defaultTo('policy');
    });
}
export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
