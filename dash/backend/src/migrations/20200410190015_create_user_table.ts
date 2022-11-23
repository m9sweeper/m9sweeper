import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('users',(table)=>{
        table.increments('id').primary();
        table.string('first_name', 100).notNullable();
        table.string('last_name', 100).notNullable();
        table.string('email', 255).notNullable().unique();
        table.string('phone', 50).nullable();
        table.string('profile_image_file_id', 255)
            .nullable().references('file_unique_id').inTable('files')
            .onUpdate('CASCADE');
        table.string('source_system_id', 100).notNullable();
        table.string('source_system_type', 100).notNullable();
        table.string('source_system_user_id', 255).notNullable();
        table.string('password', 255).nullable();
        table.bigInteger('created_at').notNullable().defaultTo(knex.raw('getCurrentUnixTimestamp() * 1000'));
        table.integer('created_by').nullable();
        table.bigInteger('updated_at').nullable();
        table.integer('updated_by').nullable();
        table.bigInteger('deleted_at').nullable();
        table.integer('deleted_by').nullable();
    });
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
