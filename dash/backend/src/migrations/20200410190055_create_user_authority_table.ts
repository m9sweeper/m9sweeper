import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('user_authorities',(table)=>{
        table.primary(['user_id','authority_id']);
        table.integer('user_id').unsigned().notNullable()
            .references('id').inTable('users')
            .onUpdate('CASCADE').index();
        table.integer('authority_id').unsigned().notNullable()
            .references('id').inTable('authority_levels')
            .onUpdate('CASCADE').index();
        table.boolean('active').notNullable().defaultTo(true);
        table.bigInteger('created_at').notNullable().defaultTo(knex.raw('getCurrentUnixTimestamp() * 1000'));
        table.integer('created_by').nullable();
        table.bigInteger('updated_at').nullable();
        table.integer('updated_by').nullable();
    });
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
