import {config as DotEnvConfig} from 'dotenv';
DotEnvConfig();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DatabaseService } from './modules/shared/services/database.service';
import { ConfigService } from '@nestjs/config';
import { MineLoggerService } from './modules/shared/services/mine-logger.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {ValidationPipe} from '@nestjs/common';
import {HttpExceptionFilter} from './exception-filters/http-exception.filter';
import {json, text, urlencoded} from 'express';
import * as ResponseTime  from 'response-time';
import {PrometheusService} from "./modules/shared/services/prometheus.service";
import { M9sweeperCronJobService } from "./cron-jobs/m9sweeper_cron_jobs.service";


async function registerSwagger(app) {
  const options = new DocumentBuilder()
      .setTitle('m9sweeper')
      .setDescription('Kubernetes Security for Everyone')
      .setVersion('1.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'jwt-auth')
      .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('/doc', app, document);
}

async function registerSwaggerBrowserForTrawler(app) {
  const options = new DocumentBuilder()
      .setTitle('m9sweeper dash')
      .setVersion('1.0')
      // .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'jwt-auth')
      .addApiKey({
            type: 'apiKey',
            name: 'x-api-key',
            in: 'header',
          }, 'x-auth-token'
      )
      .build();

  const authorizedTags = ['M9Sweeper'];

  const swaggerYml = SwaggerModule.createDocument(app, options);

  let allowedSchemas = [];

  for(const path in swaggerYml.paths) {
    for (const request in swaggerYml.paths[path]) {
      if (swaggerYml.paths[path][request]['tags'] && swaggerYml.paths[path][request]['tags'].some(t => authorizedTags.includes(t))) {
        swaggerYml.paths[path][request]['tags'] = authorizedTags;
        try {
          allowedSchemas.push(swaggerYml.paths[path][request]['requestBody']['content']['application/json']['schema']['$ref']);
        } catch (e) {

        }
        if (swaggerYml.paths[path][request]['responses']) {
          const responseDef = swaggerYml.paths[path][request]['responses'];
          for (const responseCode in responseDef) {
            try {
              if (swaggerYml.paths[path][request]['responses'][responseCode]['content']['application/json']['schema']['$ref']) {
                allowedSchemas.push(swaggerYml.paths[path][request]['responses'][responseCode]['content']['application/json']['schema']['$ref']);
              }
            } catch (e) {

            }
          }
        }
      } else {
        delete swaggerYml.paths[path][request];
        if (Object.keys(swaggerYml.paths[path]).length === 0) {
          delete swaggerYml.paths[path];
        }
      }
    }
  }

  allowedSchemas = allowedSchemas.map(s => {
    const schemaPathArray = s.split('/');
    return schemaPathArray[schemaPathArray.length -1];
  });

  const findAllNestedSchema = (schemaName) => {
    const schema = swaggerYml.components.schemas[schemaName];
    if(schema && schema['properties'] && Object.keys(schema['properties']).length > 0) {
      for(const p in schema['properties']) {
        if (schema['properties'][p] && schema['properties'][p]['items'] && schema['properties'][p]['items']['$ref']) {
          const nestedSchemaPathArray = schema['properties'][p]['items']['$ref'].split('/');
          if (nestedSchemaPathArray[nestedSchemaPathArray.length -1] && swaggerYml.components.schemas[nestedSchemaPathArray[nestedSchemaPathArray.length -1]]) {
            allowedSchemas.push(nestedSchemaPathArray[nestedSchemaPathArray.length -1]);
            findAllNestedSchema(nestedSchemaPathArray[nestedSchemaPathArray.length -1]);
          }
        } else if (schema['properties'][p] && schema['properties'][p]['$ref']) {
          const nestedSchemaPathArray = schema['properties'][p]['$ref'].split('/');
          if (nestedSchemaPathArray[nestedSchemaPathArray.length -1] && swaggerYml.components.schemas[nestedSchemaPathArray[nestedSchemaPathArray.length -1]]) {
            allowedSchemas.push(nestedSchemaPathArray[nestedSchemaPathArray.length -1]);
            findAllNestedSchema(nestedSchemaPathArray[nestedSchemaPathArray.length -1]);
          }
        }
      }
    }
    return schemaName;
  };

  allowedSchemas.forEach(as => findAllNestedSchema(as));

  const schemaDeletable = Object.keys(swaggerYml.components.schemas).filter(s => !allowedSchemas.includes(s));
  schemaDeletable.forEach(ds => delete swaggerYml.components.schemas[ds]);
  SwaggerModule.setup('/trawler-doc', app, swaggerYml);
}

async function prepareDatabaseMigrationAndSeed(app) {
  const mineLoggerService = app.get(MineLoggerService);

  const configurationService = app.get(ConfigService);
  const databaseService = app.get(DatabaseService);

  mineLoggerService.log('Preparing database migration and seed');

  try {
    if (configurationService.get('database.migrations.enabled')) {
      mineLoggerService.log('Migration Enabled.....');
      await databaseService.runMigration();
    } else {
      mineLoggerService.verbose('Migration Disabled.....');
    }

    if (configurationService.get('database.seeds.enabled')) {
      mineLoggerService.log('Seeding Enabled.....');
      await databaseService.runSeed();
    } else {
      mineLoggerService.log('Seeding Disabled.....');
    }
  } catch (e) {
    mineLoggerService.error('DB migration init failed', e.message);
    mineLoggerService.error('DB migration init failed - exception', e);
    process.exit(1);
  }
}

function customConsole(app) {
  const mineLoggerService = app.get(MineLoggerService);
  console.log = console.info = (...args) => {
    args.slice(2, args.length);
    mineLoggerService.log(...args);
  }

  console.error = (...args) => {
    args.slice(3, args.length);
    mineLoggerService.error(...args);
  }
}

async function bootstrap() {

  const app = await NestFactory.create(AppModule, {bodyParser: false});

  // process.env.NO_LOGGER !== '1' && app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
  );

  app.useGlobalFilters(new HttpExceptionFilter(app.get(MineLoggerService)));
  const prometheusService = app.get(PrometheusService);

  const requestLimit = process.env.REQUEST_LIMIT || '30mb';

  const bodyParser = json({limit: requestLimit});
  const rawParser = text({type: 'json', limit: requestLimit});
  app.use((req: any, res: any, next: any) => {
    if(req.url.includes('/api/kubehunter/hunter')) {
      rawParser(req, res, next);
    }else {
      bodyParser(req, res, next);
    }
  });

  app.use(urlencoded({ extended: true }));

  const getRoute = path => {
    let getPath =  path ? path.replace(/\?.*/g, '') : '';
    return getPath.replace(/\d+/g, '?');
  };

  app.use(ResponseTime(function (req: Request, res, time) {
    if (req.url !== '/api/v2/metrics' && req && req.url) {
      prometheusService.responses.labels(req.method, getRoute(req.url), res.statusCode).observe(time);
    }
  }));

  app.use((req: any, res: any, next: any) => {
    if (req.url !== '/api/v2/metrics' && req && req.url) {
      prometheusService.numOfRequests.inc({method: req.method});
    }
    next();
  });

  app.use(ResponseTime(function (req: Request, res, time) {
    if (req.url !== '/api/v2/metrics' && req && req.url) {
      prometheusService.responses.labels(req.method, getRoute(req.url), res.statusCode).observe(time);
    }
  }));

  const m9sCronService = app.get(M9sweeperCronJobService);
  try {
    await m9sCronService.updateExceptionAndImageMetrics();
  } catch (e) {
    console.log('There was an error setting the initial v1 exception and image metrics');
  }

  // customConsole(app);

  // console.log('Hello Test console.log','CONSOLE_OVERRIDE_CONTEXT');
  // console.info('Hello Test console.info','CONSOLE_OVERRIDE_CONTEXT');
  // console.error({label: 'Error Message', data: {userId: 2}}, new Error('Dummy exception!'),'CONSOLE_OVERRIDE_CONTEXT');

  const configurationService = app.get(ConfigService);

  await registerSwagger(app);
  await registerSwaggerBrowserForTrawler(app);
  await prepareDatabaseMigrationAndSeed(app);
  global.app = app;

  await app.listen(configurationService.get('server.port'));
}

bootstrap().catch(console.error);
