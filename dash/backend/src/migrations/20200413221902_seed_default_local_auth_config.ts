import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex('external_auth_config').insert({
        auth_name: 'Local',
        auth_type: 'LOCAL_AUTH',
        provider_type: 'LOCAL_SERVER',
        redirectable: false,
        in_site_credential: true,
        active: true
    });
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
