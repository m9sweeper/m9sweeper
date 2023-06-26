import { Injectable } from '@nestjs/common';
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
     * @returns true if the connection was successful, false if it failed for any reason.
     */
    async runCheck(): Promise<boolean> {
        try {
            // Create a connection to the database
            const connection = await this.databaseService.getConnection();

            // Exectue a simple statement against the database to verify it is responding to queries
            await connection.raw("SELECT 1");

            // Display that the database is online and responding
            console.log("Database is online and responding to queries");

            // Return that the command completed successfully
            return true;
        } catch (error) {
            // Log out any error we get
            console.error(`Unable to connect to the database: ${error.message}`);

            // Return that the command did not complete successfully
            return false;
        }
    }

    /**
     * Waits for the defined database to ensure it is responding to queries.
     * @returns true once the database is online and responding to queries.
     */
    async waitForDatabse(): Promise<boolean> {
        // Create a variable to track if we have been able to connect to the database or not
        let isOnline = false;

        // Wait for the database to be online
        while (!isOnline) {
            try {
                // Create a connection to the database
                const connection = await this.databaseService.getConnection();

                // Exectue a simple statement against the database to verify it is responding to queries
                await connection.raw("SELECT 1");

                // Display that the database is online
                console.log("Database is online and responding to queries");

                // Set the loop control to reflect that the database is now online
                isOnline = true;
            } catch (error) {
                // Log out any error we get
                console.error(`Unable to connect to the database, will try again in 2 seconds. Failure reason: ${error.message}`);
            }

            // Wait for 2 seconds before running the loop again.
            if (!isOnline) {
                await new Promise((resolve) => setTimeout(resolve, 2000));
            }
        }

        // Return that the database is now online and responding to queries
        return true;
    }
}