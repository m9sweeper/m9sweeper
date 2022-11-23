import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('authority_levels',(table)=>{
        table.increments('id').primary();
        table.string('name', 50).unique('authority_levels_unq_name').notNullable();
    });
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
