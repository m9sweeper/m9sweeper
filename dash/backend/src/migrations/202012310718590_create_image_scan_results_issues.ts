import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('image_scan_results_issues', (table) => {
        table.increments('id').primary();
        table.integer('image_results_id')
            .notNullable().references('id').inTable('image_scan_results');
        table.integer('scanner_id').notNullable();
        table.string('name', 255).notNullable();
        table.string('type', 255).notNullable();
        table.string('severity', 255).notNullable();
        table.string('description', 255).notNullable();
        table.boolean('is_compliant').notNullable();
        table.boolean('is_fixable').notNullable();
        table.boolean('was_fixed').notNullable();
        table.bigInteger('created_at').notNullable().defaultTo(knex.raw('getCurrentUnixTimestamp() * 1000'));
        table.bigInteger('updated_at').nullable();
        table.bigInteger('deleted_at').nullable();
    });
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
