import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    await knex.schema.alterTable('images', table => {
        table.renameColumn('date', 'last_scanned');
    });
    await knex.schema.alterTable('images', table => {
        table.text('scan_results').nullable();
    });
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
