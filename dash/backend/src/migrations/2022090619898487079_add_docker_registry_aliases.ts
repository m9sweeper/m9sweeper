import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('docker_registry_aliases', (table) => {
        table.increments('id')
            .primary();
        table.integer('docker_registry_id')
            .notNullable()
            .index();
        table.foreign('docker_registry_id')
            .references('id')
            .inTable('docker_registries');
        table.string('alias')
            .notNullable()
            .index()
            .unique();
    });
}

export async function down(knex: Knex): Promise<any> {
    return knex.schema.dropTable('docker_registry_aliases');
}
