import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any>{
    return knex.schema.alterTable('policies', table => {
        table.boolean('relevant_for_all_clusters').nullable().defaultTo(false);
    });
}
export async function down(knex: Knex): Promise<any>{
    return Promise.resolve(true);
}
