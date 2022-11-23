import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('exceptions', (table) => {
        // Columns
        table.increments('id').primary(); // Primary Key
        table.string('title', 255).notNullable();
        table.text('reason').nullable();
        table.date('start_date').notNullable();
        table.date('end_date').nullable();
        table.string('status', 30).notNullable();
        table.integer('scanner_id'); // FK scanners table
        table.string('issue_identifier', 255);
        table.boolean('relevant_for_all_policies');
        table.boolean('relevant_for_all_clusters');
        table.boolean('relevant_for_all_kubernetes_namespaces');
        table.bigInteger('deleted_at').nullable();
        table.bigInteger('created_at').notNullable();
        table.integer('created_by').nullable(); // FK users table
        table.integer('updated_by').nullable();
        table.integer('deleted_by').nullable();

        // Set foreign Keys
        table.foreign('scanner_id').references('id').inTable('scanners');
        table.foreign('created_by').references('id').inTable('users');
    });
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
