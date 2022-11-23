import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.alterTable('policies', table => {
        table.integer('new_scan_grace_period').nullable();
        table.integer('rescan_grace_period').nullable();
    })
}


export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
