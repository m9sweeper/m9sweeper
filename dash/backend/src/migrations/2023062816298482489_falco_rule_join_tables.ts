import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.transaction(async (trx) => {
        await trx.schema.alterTable('falco_rules', (table) => {
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
        });

        const ruleId = (await trx.insert({
            action: 'ignore',
            all_clusters: true,
            all_namespaces: false
        }, 'id').into('falco_rules'))[0]?.id;

        await trx.insert({
            namespace: 'kube-system',
            falco_rule_id: ruleId
        }).into('falco_rules_namespace');

        await trx.insert({
            namespace: 'm9sweeper-system',
            falco_rule_id: ruleId
        }).into('falco_rules_namespace');
    })

}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
