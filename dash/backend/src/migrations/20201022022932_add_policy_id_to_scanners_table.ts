import { Knex } from 'knex';
export async function up(knex: Knex): Promise<any> {
    return knex.schema.hasColumn('scanners', 'policy_id').then((exist) => {
        if (!exist) {
            return knex.schema.alterTable('scanners', table => {
                table.integer('policy_id').notNullable().defaultTo(1);
            });
        }
    });
}
export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
