import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.renameTable('comments', 'exception_comments')
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
