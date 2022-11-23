import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.hasColumn('policies', 'scanner_ids').then(function (exists) {
        if (exists) {
            return knex.schema.alterTable('policies', table => {
                table.dropColumn('scanner_ids');
            });
        }
    });
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
