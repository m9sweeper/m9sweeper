import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.alterTable('docker_registries', table => {
        table.string('auth_type').defaultTo('Basic');
    });
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
