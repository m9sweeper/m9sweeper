import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('falco_email',(table)=>{
        table.increments('id').primary();
        table.bigInteger('creation_timestamp')
            .notNullable()
            .defaultTo(knex.raw('getCurrentUnixTimestamp() * 1000'));
        table.date('calendar_date')
            .notNullable()
            .defaultTo(knex.raw('CURRENT_DATE'));
        table.integer('cluster_id');
        table.string('anomaly_signature');
    });
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
