import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('exceptions_policies', (table) => {
        table.primary(['exception_id','policy_id']);
        table.integer('exception_id').unsigned().notNullable()
            .references('id').inTable('exceptions').index();
        table.integer('policy_id').unsigned().notNullable()
            .references('id').inTable('policies').index();
    });
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
