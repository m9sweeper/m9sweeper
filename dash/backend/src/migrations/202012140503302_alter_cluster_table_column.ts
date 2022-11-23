import { Knex } from 'knex';
export async function up(knex: Knex): Promise<any> {
    return knex.schema.alterTable('clusters', table => {
        table.string('ip_address', 500).notNullable().alter();

    })
}
export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
