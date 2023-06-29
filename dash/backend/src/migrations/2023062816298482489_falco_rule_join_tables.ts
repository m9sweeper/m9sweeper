import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    await knex.schema.alterTable('falco_rules', (table) => {
        table.dropColumn('cluster_id');
        table.dropColumn('namespace');
        table.boolean('all_namespaces').defaultTo(false);
        table.boolean('all_clusters').defaultTo(false);
    }).createTable('falco_rules_namespace', (table) => {
        table.primary(['falco_rule_id','namespace']);
        table.integer('falco_rule_id').references('id')
          .inTable('falco_rules').notNullable();
        table.string('namespace', 255).notNullable();
    }).createTable('falco_rules_cluster', (table) => {
        table.primary(['falco_rule_id','cluster_id']);
        table.integer('falco_rule_id').references('id')
          .inTable('falco_rules').notNullable();
        table.integer('cluster_id').references('id')
          .inTable('clusters').notNullable();
    })
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
