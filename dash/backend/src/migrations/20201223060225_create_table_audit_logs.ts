import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('audit_logs',(table)=>{
        table.increments('id').primary();
        table.integer('organization_id', 100).notNullable();
        table.string('entity_type', 50).notNullable();
        table.integer('entity_id', 50).notNullable();
        table.bigInteger('created_date').notNullable().defaultTo(knex.raw('getCurrentUnixTimestamp() * 1000'));
        table.string('type').nullable();
        table.string('level', 255).nullable();
        table.string('description', 255).nullable();
        table.json('data').nullable();
        table.index(['organization_id','entity_type', 'entity_id'], 'audit_logs_index');
        table.bigInteger('created_at').notNullable().defaultTo(knex.raw('getCurrentUnixTimestamp() * 1000'));
        table.bigInteger('updated_at').nullable();
        table.bigInteger('deleted_at').nullable();
    });
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
