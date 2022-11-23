import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('kubernetes_pods' , table => {
        table.increments('id').primary();
        table.string('name', 255).notNullable();
        table.string('self_link', 255).nullable();
        table.string('uid', 255).nullable();
        table.string('resource_version', 255).nullable();
        table.bigInteger('creation_timestamp').nullable();
        table.string('namespace',255).nullable();
        table.string('generate_name').nullable();
        table.boolean('compliant').defaultTo(false);
    });
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
