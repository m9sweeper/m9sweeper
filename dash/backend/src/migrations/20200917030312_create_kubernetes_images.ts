import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('kubernetes_images' , table => {
        table.increments('id').primary();
        table.string('name', 255).notNullable();
        table.string('image', 255).nullable();
        table.string('deployment_name', 255).nullable();
        table.string('cluster_name',255).nullable();
        table.string('namespace',255).nullable();
        table.boolean('compliant').defaultTo(false);
    });
}


export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
