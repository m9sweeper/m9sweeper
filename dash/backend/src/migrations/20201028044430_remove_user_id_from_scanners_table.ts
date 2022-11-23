import { Knex } from 'knex';
export async function up(knex: Knex): Promise<any> {
    return knex.schema.hasColumn('scanners', 'user_id').then((exist) => {
        if (exist) {
            return knex.schema.alterTable('scanners', table => {
                table.dropColumn('user_id');
            });
        }
    });
}
export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
