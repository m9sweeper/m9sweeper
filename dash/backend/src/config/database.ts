export default {
  client: process.env.DATABASE_CLIENT || 'postgresql',
  connection: {
    host: process.env.DATABASE_CONNECTION_HOST || 'localhost',
    port: +process.env.DATABASE_CONNECTION_PORT || 5432,
    database: process.env.DATABASE_CONNECTION_DATABASE || 'postgres',
    user: process.env.DATABASE_CONNECTION_USERNAME || 'postgres',
    password: process.env.DATABASE_CONNECTION_PASSWORD || 'postgres'
  },
  pool: {
    min: +process.env.DATABASE_POOL_MIN || 1,
    max: +process.env.DATABASE_POOL_MAX || 5,
    idleTimeoutMillis: +process.env.DATABASE_POOL_IDLETIMEOUT || 60000
  },
  acquireConnectionTimeout: +process.env.DATABASE_ACQUIRE_CONNECTION_TIMEOUT || 20000,
  migrations: {
    enabled: process.env.DATABASE_MIGRATION_ENABLED !== '0', // default to on unless turned off
    tableName: process.env.DATABASE_MIGRATION_TABLE_NAME || 'migrations',
    directory: process.env.DATABASE_MIGRATION_DIRECTORY || './migrations'
  },
  seeds: {
    enabled: +process.env.DATABASE_SEED_ENABLED === 1, // default to off unless turned on
    directory: process.env.DATABASE_SEED_DIRECTORY || './seeds'
  },
  searchPath: [process.env.DATABASE_DEFAULT_SCHEMA || 'public']
};
