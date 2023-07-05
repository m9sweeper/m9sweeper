import { spawn } from 'child_process';
import process from 'process';

/**
 * Provide an easy way to run commands on the system shell in an async manner
 *
 * @param command The command to run
 * @returns The exit code of the command
 */
export async function exec(command: string) {
    // Display the command that will be run before running it
    console.info(`Running command: ${command}`);

    // Start running the command
    const instance = spawn(command, {shell: true});

    // Capture the events coming out of the command instance to that we can handle error and output logs
    // and capture the command exit code to be used in the return
    return new Promise((resolvFunc) => {
        // Capture data on the stdout pipe of the command and display it in the console
        instance.stdout.on("data", (x) => {
            process.stdout.write(x.toString());
        });

        // Capture data on the stderror pipe of the command and display it in the console
        instance.stderr.on("data", (x) => {
            process.stderr.write(x.toString());
        });

        // Capture the exit code from the command process and disaply it in the consle and return that code
        // so that we know that the command has been finished.
        instance.on("exit", (code) => {
            console.info(`Command completed with exit code: ${code}`);
            resolvFunc(code);
        });
    });
}