export enum CliCommands {
  UserInit = 'users:init',
  ClusterSeed = 'cluster:seed',
  ClusterSync = 'cluster:sync',
  SyncExceptionStatus = 'sync:exception-status',
  SyncGateKeeperExceptions = 'sync:gatekeeper-exceptions',
  RegistryInit = 'registries:init',
  ExceptionInit = 'exceptions:init',
  PopulateKubernetesHistory = 'populate:kubernetes-history',
  DatabaseCheck = 'database:check',
  DatabaseWait = 'database:wait',
}
