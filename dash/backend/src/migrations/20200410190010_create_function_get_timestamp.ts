import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
    const raw = `CREATE FUNCTION getCurrentUnixTimestamp() RETURNS bigint AS
                    $BODY$ begin
                        RETURN FLOOR(EXTRACT(EPOCH FROM current_timestamp AT TIME ZONE 'UTC'));
                    END; $BODY$
                 LANGUAGE plpgsql;`;
    return knex.schema.raw(raw);
}

export async function down(knex: Knex): Promise<any> {
    return Promise.resolve(true);
}
