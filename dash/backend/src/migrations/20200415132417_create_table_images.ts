import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('images',(table)=>{
        table.increments('id').primary();
        table.string('url',255).notNullable();
        table.string('name',100).notNullable();
        table.string('tag',100).notNullable();
        table.string('docker_image_id',255).notNullable();
        table.json('summary').notNullable();
        table.bigInteger('date').nullable();
        table.bigInteger('created_at').notNullable().defaultTo(knex.raw('getCurrentUnixTimestamp() * 1000'));
        table.bigInteger('updated_at').nullable();
        table.bigInteger('deleted_at').nullable();
    });
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
