import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.renameTable('app_settings', 'organization_settings');
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
