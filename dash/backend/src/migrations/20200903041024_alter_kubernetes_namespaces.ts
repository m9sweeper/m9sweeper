import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.alterTable('kubernetes_namespaces' , table => {
        table.bigInteger('creation_timestamp').notNullable().defaultTo(0).alter();
    });
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
