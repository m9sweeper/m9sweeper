import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.select('id')
        .from('docker_registries')
        .where('hostname', 'docker.io')
        .then(response => {
            if (response[0]?.id) {
                return knex.insert({docker_registry_id: response[0].id, alias: 'index.docker.io'})
                    .into('docker_registry_aliases')
                    .onConflict()
                    .ignore();
            }
        });
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
