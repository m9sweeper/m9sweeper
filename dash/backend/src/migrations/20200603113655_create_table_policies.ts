import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('policies', (table) => {
        table.increments('id').primary();
        table.string('name', 255).notNullable();
        table.boolean('enabled').defaultTo(true).notNullable();
        table.boolean('enforcement').defaultTo(true).notNullable();
        table.text('description').nullable();
        table.jsonb('scanner_ids');
        table.bigInteger('created_at').notNullable().defaultTo(knex.raw('getCurrentUnixTimestamp() * 1000'));
        table.bigInteger('updated_at').nullable();
    });
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
