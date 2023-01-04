import { Knex } from 'knex';
export async function up(knex: Knex): Promise<any> {
    return knex.schema.alterTable('exceptions', table => {
        table.string('alternate_severity').nullable();
    });
}
export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
