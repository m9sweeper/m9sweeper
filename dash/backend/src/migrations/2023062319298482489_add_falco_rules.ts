import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('falco_rules', (table) => {
        table.increments('id')
            .primary();
        table.integer('cluster_id');
        table.bigInteger('created_at')
            .notNullable()
            .defaultTo(knex.raw('getCurrentUnixTimestamp() * 1000'));
        table.string('action');
        table.string('falco_rule');
        table.string('namespace');
        knex.raw('create index idx_cluster_id on falco_rules(cluster_id)');
        knex.raw('create index idx_cluster_id_created_at on falco_rules(cluster_id, created_at desc)');
    });
}

export async function down(knex: Knex): Promise<any> {
    return knex.schema.dropTable('falco_rules');
}
