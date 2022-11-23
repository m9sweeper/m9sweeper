import { Knex } from 'knex';
export async function up(knex: Knex): Promise<any> {
    return knex.schema.alterTable('cluster_group', table => {
        table.bigInteger('deleted_at').nullable();
    })
}
export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}

