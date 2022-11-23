import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex('docker_registries')
        .where('login_required', false)
        .update('auth_type', 'None');
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
