import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('external_auth_config', function (table) {
        table.increments('id').primary();
        table.string('auth_name', 100).notNullable();
        table.string('auth_type', 30).notNullable(); // OAUTH2/LDAP/LOCAL
        table.string('provider_type', 100).nullable(); // GOOGLE / Github
        table.json('auth_strategy_config').defaultTo('{}');
        table.boolean('redirectable').defaultTo(false);
        table.boolean('in_site_credential').defaultTo(false);
        table.boolean('active').defaultTo(true);
        table.bigInteger('created_at').defaultTo(knex.raw('getCurrentUnixTimestamp() * 1000'));
        table.integer('created_by').nullable();
        table.bigInteger('updated_at').nullable();
        table.integer('updated_by').nullable();
    });
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
