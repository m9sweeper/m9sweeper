import { Knex } from 'knex';
export async function up(knex: Knex): Promise<any> {
    return knex.schema.alterTable('docker_registries', table => {
        table.string('hostname', 250).unique().notNullable().alter();
    });
}
export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
