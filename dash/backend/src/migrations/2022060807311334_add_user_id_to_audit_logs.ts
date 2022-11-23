import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any>{
    return knex.schema.alterTable('audit_logs', table => {
        table.integer('user_id').nullable();
        table.string('event_type').nullable();
    });
}
export async function down(knex: Knex): Promise<any>{
    return Promise.resolve(true);
}
