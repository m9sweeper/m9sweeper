import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('exceptions_kubernetes_namespaces', (table) => {
        table.primary(['exception_id','namespace_name']);
        table.integer('exception_id').unsigned().notNullable()
            .references('id').inTable('exceptions').index();
        table.string('namespace_name', 255).notNullable()
    });
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
