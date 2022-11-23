import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any>{
    return knex.schema.alterTable('exception_comments', table => {
        table.bigInteger('deleted_at').nullable();
        table.integer('deleted_by').nullable();
    });
}
export async function down(knex: Knex): Promise<any>{
    return Promise.resolve(true);
}
