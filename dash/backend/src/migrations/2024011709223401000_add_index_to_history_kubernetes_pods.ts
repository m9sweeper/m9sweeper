import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any>  {
  return knex.schema.alterTable('history_kubernetes_pods', function(table){
      table.index('saved_date', 'idx_saved_date');
      table.index('cluster_id', 'idx_cluster_id');
      table.index('compliant', 'idx_compliant');
  });
}

export async function down(knex: Knex): Promise<any> {
  return knex.schema.alterTable('history_kubernetes_pods', function(table){
    table.dropIndex('saved_date', 'idx_saved_date');
    table.dropIndex('cluster_id', 'idx_cluster_id');
    table.dropIndex('compliant', 'idx_compliant');
});
}