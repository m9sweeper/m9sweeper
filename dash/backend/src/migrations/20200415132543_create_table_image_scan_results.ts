import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('image_scan_results',(table)=>{
        table.increments('id').primary();
        table.string('scanner_name',100).notNullable();
        table.integer('image_id').notNullable();
        table.string('summary',255).notNullable();
        table.json('issues').notNullable();
        table.bigInteger('created_at').notNullable().defaultTo(knex.raw('getCurrentUnixTimestamp() * 1000'));
        table.bigInteger('updated_at').nullable();
        table.bigInteger('deleted_at').nullable();
    });
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
