import { spawn } from 'child_process';
import process from 'process';

export async function exec(...command) {
    console.info(`Running command: ${command.join(" ")}`);
    const instance = spawn(command[0], command.slice(1));

    return new Promise((resolvFunc) => {
        instance.stdout.on("data", (x) => {
            process.stdout.write(x.toString());
        });

        instance.stderr.on("data", (x) => {
            process.stderr.write(x.toString());
        });

        instance.on("exit", (code) => {
            console.info(`Command completed with exit code: ${code}`);
            resolvFunc(code);
        });
    });
}