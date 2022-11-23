import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.alterTable('docker_registries', table => {
        table.json('auth_details');
    });
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
