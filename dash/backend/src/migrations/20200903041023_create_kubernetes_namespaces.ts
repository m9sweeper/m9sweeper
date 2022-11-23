import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('kubernetes_namespaces' , table => {
        table.increments('id').primary();
        table.string('name', 255).notNullable();
        table.string('self_link', 255).nullable();
        table.string('uid', 255).nullable();
        table.string('resource_version', 255).nullable();
        table.string('creation_timestamp', 255).nullable();
        table.boolean('compliant').defaultTo(false);
    });
}


export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
