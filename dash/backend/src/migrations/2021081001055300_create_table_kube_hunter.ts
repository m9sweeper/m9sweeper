import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('kube_hunter', (table) => {
        table.increments('id').primary();
        table.integer('cluster_id').references('clusters.id')
        table.bigInteger('created_at').notNullable().defaultTo(knex.raw('getCurrentUnixTimestamp() * 1000'));
        table.string('uuid').notNullable().unique();
        table.specificType('nodes', 'json');
        table.specificType('services', 'json');
        table.specificType('vulnerabilities', 'json');
    });}

export async function down(knex: Knex): Promise<any> {
    return knex.schema.dropTable('kube_hunter');
    }
