import { Knex } from 'knex';
export async function up(knex: Knex): Promise<any> {
    return knex.schema.alterTable('images', table => {
        table.integer('critical_issues').nullable();
        table.integer('major_issues').nullable();
        table.integer('medium_issues').nullable();
        table.integer('low_issues').nullable();
        table.integer('negligible_issues').nullable();
        table.boolean('running_in_cluster').notNullable().defaultTo(true);

    })
}
export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
