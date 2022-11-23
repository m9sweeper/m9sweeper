import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    // No longer necessary to seed deployments since they can be scraped
    return Promise.resolve(true);
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
