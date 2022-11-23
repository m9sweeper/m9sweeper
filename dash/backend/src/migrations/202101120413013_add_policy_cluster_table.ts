import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('policy_cluster', table => {
        table.bigIncrements('id');
        table.bigInteger('cluster_id').notNullable();
        table.bigInteger('policy_id').notNullable();
        table.boolean('active').defaultTo(true);
        table.bigInteger('created_at').notNullable().defaultTo(knex.raw('getCurrentUnixTimestamp() * 1000'));
        table.integer('created_by').nullable();
        table.bigInteger('updated_at').nullable();
        table.integer('updated_by').nullable();
    });
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
