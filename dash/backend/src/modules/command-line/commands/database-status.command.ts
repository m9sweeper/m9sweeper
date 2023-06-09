import { Injectable } from '@nestjs/common';
import { Command } from 'nestjs-command';
import { Client } from 'pg';

/**
 * This command is used mainly by init containers and stuff to verify database connectivity before attempting to start pods to helm with errors
 */
@Injectable()
export class DatabaseStatusCommand {
    @Command({command: 'database:status', describe: 'Checks to ensure the database is online and responding to queries.' })
    async runCheck(): Promise<void> {
        // Create the database client using the most basic PG library to avoid any other errors potentially being
        // thrown somewhere else that can screw up the check. This also keeps it extremly light weight.
        const client = new Client({
            host: process.env.DATABASE_CONNECTION_HOST,
            port: process.env.DATABASE_CONNECTION_PORT,
            database: process.env.DATABASE_CONNECTION_DATABASE,
            user: process.env.DATABASE_CONNECTION_USERNAME,
            password: process.env.DATABASE_CONNECTION_PASSWORD,
        });

        // Attempt the connect to the databse and run the SELECT 1 query commonly used to verify databse connectivity
        // If the query succesds then return a 0 status code and exit otherwise return a status code of 1 showing it could not connect.
        try {
            await client.conect();
            await client.query('SELECT 1');
            await client.end();

            console.log("Database is responding to queries at this time.");
            process.exit(0);
        } catch (error) {
            console.error('Database is not responding to queries at this time.');
            process.exit(1);
        }
    }
}