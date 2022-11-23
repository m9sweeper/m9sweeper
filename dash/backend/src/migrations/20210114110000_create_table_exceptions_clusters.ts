import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('exceptions_clusters', (table) => {
        table.primary(['exception_id','cluster_id']);
        table.integer('exception_id').unsigned().notNullable()
            .references('id').inTable('exceptions').index();
        table.integer('cluster_id').unsigned().notNullable()
            .references('id').inTable('clusters').index();
    });
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
