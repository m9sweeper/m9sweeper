import {config as DotEnvConfig} from 'dotenv';
DotEnvConfig();

import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {WINSTON_MODULE_NEST_PROVIDER} from 'nest-winston';
import * as process from 'process';
import {JobsCliController} from './modules/command-line/controllers/jobs-cli.controller';

async function cli () {
    const app = await NestFactory.createApplicationContext(AppModule);
    app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
    const jobsController = app.get(JobsCliController);
    const success = await jobsController.executeCommand(process.argv);

    process.exit(success ? 0 : 1);
}

cli().catch(e => {
    console.log(e);``
    process.exit(1); // it failed!
});
