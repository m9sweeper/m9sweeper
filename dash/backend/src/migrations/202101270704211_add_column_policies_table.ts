import { Knex } from 'knex';
export async function up(knex: Knex): Promise<any> {
    return knex.schema.alterTable('policies', table => {
        table.bigInteger('deleted_at').nullable().defaultTo(null);
    })
}
export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
