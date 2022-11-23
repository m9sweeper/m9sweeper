import { Knex } from 'knex';

// Empty Migration so that the removal of this migration doesn't break any local environments
export async function up(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
