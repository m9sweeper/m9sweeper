import { Injectable } from '@nestjs/common';
import { Command } from 'nestjs-command';
import { DatabaseService } from '../../shared/services/database.service';

/**
 * This command is used mainly by init containers and stuff to verify database connectivity before attempting to start pods to helm with errors
 */
@Injectable()
export class DatabaseStatusCommand {

    // Create the constructor so that we can utilize the DatabaseService for this command
    constructor(private readonly databaseService: DatabaseService) {}

    /**
     * Run a check against the defined database to ensure it is responding to queries.
     */
    @Command({command: 'database:status', describe: 'Checks to ensure the database is online and responding to queries.' })
    async runCheck() {
        try {
            // Create a connection to the database
            const connection = await this.databaseService.getConnection();

            // Exectue a simple statement against the database to verify it is responding to queries
            await connection.raw("SELECT 1");

            // Display that the database is online and responding and ensure we exit the command with a clean return code
            console.log("Database is online and responding");
            process.exit(0);
        } catch (error) {
            // Log out any error we get and ensure the command exits wit a failed return code
            console.error('Unable to connect to the databse: ', error.message);
            process.exit(1);
        }
    }
}