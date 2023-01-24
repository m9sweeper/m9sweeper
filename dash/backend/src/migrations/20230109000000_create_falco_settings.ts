import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('falco_settings',(table)=>{
        table.integer('cluster_id').primary();
        table.boolean('send_notification_anomaly');
        table.integer('anomaly_notification_frequency');
        table.string('severity_level');
        table.boolean('send_notification_summary');
        table.string('summary_notification_frequency');
        table.string('weekday');
        table.string('who_to_notify');
        table.string('email_list');
    });
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
