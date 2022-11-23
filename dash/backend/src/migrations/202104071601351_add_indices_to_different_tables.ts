import { Knex } from 'knex';
export async function up(knex: Knex): Promise<any> {
    const tableIndexArray = [
        {
            tableName: 'images',
            columns: ['cluster_id', 'running_in_cluster'],
            indexName: 'images_by_cluster_id'
        },
        {
            tableName: 'images',
            columns: ['cluster_id', 'created_at'],
            indexName: 'images_cluster_id_created_idx'
        },
        {
            tableName: 'image_scan_results',
            columns: ['image_id', 'is_latest'],
            indexName: 'image_scan_results_by_image_id'
        },
        {
            tableName: 'kubernetes_deployments',
            columns: ['cluster_id', 'namespace'],
            indexName: 'kubernetes_deployments_by_cluster'
        },
        {
            tableName: 'kubernetes_namespaces',
            columns: ['cluster_id'],
            indexName: ''
        },
        {
            tableName: 'kubernetes_images',
            columns: ['cluster_id', 'deployment_name'],
            indexName: ''
        },
        {
            tableName: 'kubernetes_images',
            columns: ['image_hash'],
            indexName: ''
        },
        {
            tableName: 'image_scan_results_issues',
            columns: ['image_results_id'],
            indexName: ''
        },
        {
            tableName: 'kubernetes_pods',
            columns: ['cluster_id'],
            indexName: ''
        },
        {
            tableName: 'tags',
            columns: ['group_id'],
            indexName: ''
        },
        {
            tableName: 'scanners',
            columns: ['policy_id'],
            indexName: ''
        },
        {
            tableName: 'policy_cluster',
            columns: ['policy_id'],
            indexName: ''
        },
        {
            tableName: 'policy_cluster',
            columns: ['cluster_id'],
            indexName: ''
        },
        {
            tableName: 'history_kubernetes_namespaces',
            columns: ['cluster_id', 'saved_date'],
            indexName: ''
        },
        {
            tableName: 'history_kubernetes_images',
            columns: ['cluster_id', 'saved_date', 'namespace'],
            indexName: ''
        },
        {
            tableName: 'history_kubernetes_images',
            columns: ['cluster_id', 'saved_date', 'deployment_name'],
            indexName: ''
        },
        {
            tableName: 'history_kubernetes_deployments',
            columns: ['cluster_id', 'saved_date', 'namespace'],
            indexName: ''
        },
        {
            tableName: 'history_kubernetes_clusters',
            columns: ['group_id', 'saved_date'],
            indexName: ''
        },
        {
            tableName: 'clusters',
            columns: ['group_id'],
            indexName: ''
        },
        {
            tableName: 'api_keys',
            columns: ['api'],
            indexName: ''
        },
        {
            tableName: 'api_keys',
            columns: ['user_id'],
            indexName: ''
        },
        {
            tableName: 'users',
            columns: ['email', 'password'],
            indexName: ''
        },
    ];

    return knex.schema.alterTable('image_scan_results', table => {
        table.boolean('is_latest').nullable();
    }).then(() => {
        return knex('image_scan_results').update({
            is_latest: true
        }).whereRaw(`id IN (SELECT MAX(id) AS id FROM image_scan_results GROUP BY image_id, TO_TIMESTAMP(CAST(created_at/1000 AS BIGINT))::DATE)`);
    }).then(() => {
        return Promise.all(tableIndexArray.map(value => {
            return knex.schema.alterTable(value.tableName, table => {
                if (value.indexName) {
                    table.index(value.columns, value.indexName);
                } else{
                    table.index(value.columns);
                }
            });
        }));
    });
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
