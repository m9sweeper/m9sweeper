import { Injectable, Scope } from '@nestjs/common';
import { knex, Knex } from 'knex';
import { ConfigService } from '@nestjs/config';
import { MineLoggerService } from './mine-logger.service';

interface IDatabaseService {
  getServiceName();
  getConnection();
  runMigration();
  runSeed();
}

@Injectable({ scope: Scope.DEFAULT })
export class DatabaseService implements IDatabaseService {

  constructor(
    private readonly configurationService: ConfigService,
    private readonly mineLoggerService: MineLoggerService
  ) {
    this.mineLoggerService.setContext(DatabaseService.name);
    this.mineLoggerService.verbose('Database Initializing....');
  }

  private _knexConnection: Knex;

  getServiceName(): string {
    return DatabaseService.name;
  }

  async getConnection(): Promise<Knex> {
    if (!this._knexConnection) {
      this._knexConnection = knex({
        client: this.configurationService.get('database.client'),
        connection: {
          host: this.configurationService.get('database.connection.host'),
          port: this.configurationService.get('database.connection.port'),
          database: this.configurationService.get('database.connection.database'),
          user: this.configurationService.get('database.connection.user'),
          password: this.configurationService.get('database.connection.password')
        },
        pool: {
          min: this.configurationService.get('database.pool.min'),
          max: this.configurationService.get('database.pool.max'),
          idleTimeoutMillis: this.configurationService.get('database.pool.idleTimeoutMillis'),
        },
        acquireConnectionTimeout: this.configurationService.get('database.acquireConnectionTimeout'),
        migrations: {
          tableName: this.configurationService.get('database.migrations.tableName'),
          directory: this.configurationService.get('common.base.directory') + this.configurationService.get('database.migrations.directory'),
          loadExtensions: ['.js']
        },
        seeds: {
          directory: this.configurationService.get('common.base.directory') + this.configurationService.get('database.seeds.directory'),
          loadExtensions: ['.js', '.ts']
        },
        searchPath: this.configurationService.get('database.searchPath') as string[]
      });
    }
    return this._knexConnection;
  }

  async runMigration(): Promise<any> {
    return (await this.getConnection()).migrate.latest();
  }

  async runSeed(): Promise<any> {
    return (await this.getConnection()).seed.run();
  }


}
