import { Knex } from 'knex';
export async function up(knex: Knex): Promise<any> {
    return knex.schema.alterTable('exception_comments', table => {
        table.index(['exception_id']);
    });
}
export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
