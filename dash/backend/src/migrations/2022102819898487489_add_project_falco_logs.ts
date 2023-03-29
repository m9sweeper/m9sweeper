import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('project_falco_logs', (table) => {
        table.increments('id')
            .primary();
        table.integer('cluster_id');
        table.bigInteger('creation_timestamp')
            .notNullable()
            .defaultTo(knex.raw('getCurrentUnixTimestamp() * 1000'));
        table.date('calendar_date')
            .notNullable()
            .defaultTo(knex.raw('CURRENT_DATE'));
        table.string('anomaly_signature');
        table.string('anomaly_signature_global');
        table.string('rule');
        table.string('namespace');
        table.string('image');
        table.string('container');
        table.string('level');
        table.json('raw');
        table.text('message');
        knex.raw('create index idx_cluster_id_timestamp on project_falco_logs(cluster_id, creation_timestamp desc)');
        knex.raw('create index idx_cluster_id_id on project_falco_logs(cluster_id, id desc)');
        knex.raw('create index idx_cluster_id_level_calendar_date on project_falco_logs(cluster_id, level, calendar_date desc)');
        knex.raw('create index idx_cluster_id_anomaly_signature_calendar_date on project_falco_logs(cluster_id, anomaly_signature, calendar_date desc)');
        knex.raw('create index idx_anomaly_signature_global_calendar_date on project_falco_logs(anomaly_signature_global, calendar_date desc)');
    });
}

export async function down(knex: Knex): Promise<any> {
    return knex.schema.dropTable('project_falco_logs');
}
