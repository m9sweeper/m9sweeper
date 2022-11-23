import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any>{
    return knex('docker_registries').insert({
        name: 'Dockerhub',
        hostname: 'docker.io',
        login_required: false,
        username: null,
        password:  null
    })
}
export async function down(knex: Knex): Promise<any>{
    return Promise.resolve(true);
}
