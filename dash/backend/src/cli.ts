import {config as DotEnvConfig} from 'dotenv';
DotEnvConfig();

import {NestFactory} from '@nestjs/core';
import {CommandModule, CommandService} from 'nestjs-command';
import {AppModule} from './app.module';
import {WINSTON_MODULE_NEST_PROVIDER} from 'nest-winston';

async function cli () {
    const app = await NestFactory.createApplicationContext(AppModule);
    app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
    app.select(CommandModule).get(CommandService).exec().then(() => {
      app.close().then(() => { process.exit(); });
    });
}

cli().catch(e => {
    console.log(e);``
    process.exit(1); // it failed!
});
