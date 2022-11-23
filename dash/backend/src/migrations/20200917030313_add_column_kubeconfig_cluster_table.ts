import { Knex } from 'knex';
export async function up(knex: Knex): Promise<any> {
    return knex.schema.alterTable('clusters', table => {
        table.text('kube_config').nullable().defaultTo('');
    })
}
export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
