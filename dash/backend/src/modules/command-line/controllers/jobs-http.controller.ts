import {ApiTags} from '@nestjs/swagger';
import {Controller, Get, Param, Query, UnauthorizedException, UseInterceptors} from '@nestjs/common';
import {ResponseTransformerInterceptor} from '../../../interceptors/response-transformer.interceptor';
import {ClusterCommand} from '../commands/cluster.command';
import {ClusterSyncCommand} from '../commands/cluster-sync.command';
import {SyncExceptionStatusCommand} from '../commands/exception.command';
import {GatekeeperExceptionCommand} from '../commands/gatekeeper-exception.command';
import {HelmSetupCommand} from '../commands/helm-setup.command';
import {KubernetesHistoryCommand} from '../commands/kubernetes-history.command';
import {UserDao} from '../../user/dao/user.dao';
import {AuthService} from '../../auth/services/auth.service';
import {AuthorityId} from '../../user/enum/authority-id';

@ApiTags('Jobs')
@Controller()
@UseInterceptors(ResponseTransformerInterceptor)
export class JobsHttpController {
  constructor(
    protected readonly clusterCommand: ClusterCommand,
    protected readonly clusterSyncCommand: ClusterSyncCommand,
    protected readonly exceptionCommand: SyncExceptionStatusCommand,
    protected readonly gatekeeperExceptionCommand: GatekeeperExceptionCommand,
    protected readonly helmSetupCommand: HelmSetupCommand,
    protected readonly kubernetesHistoryCommand: KubernetesHistoryCommand,
    protected readonly userDao: UserDao,
    protected readonly authService: AuthService
  ) {
  }

  @Get('/sync-cluster/:clusterId')
  async syncCluster(
    @Param('clusterId') clusterId: string,
    @Query('apiKey') apiKey: string
  ): Promise<boolean> {
    if (!(await this.checkCronAuth(apiKey))) {
      throw new UnauthorizedException('Access Denied!');
    }

    return await this.clusterSyncCommand.syncCluster(clusterId);
  }

  @Get('/populate-kubernetes-history')
  async populateKubernetseHistory(@Query('apiKey') apiKey: string) {
    if (!(await this.checkCronAuth(apiKey))) {
      throw new UnauthorizedException('Access Denied!');
    }

    return await this.kubernetesHistoryCommand.get();
  }

  @Get('/sync-exception-status')
  async syncExceptionStatus(@Query('apiKey') apiKey: string) {
    if (!(await this.checkCronAuth(apiKey))) {
      throw new UnauthorizedException('Access Denied!');
    }

    return await this.exceptionCommand.syncExceptionStatus();
  }

  @Get('/sync-gatekeeper-exceptions')
  async syncGatekeeperExceptions(@Query('apiKey') apiKey: string) {
    if (!(await this.checkCronAuth(apiKey))) {
      throw new UnauthorizedException('Access Denied!');
    }

    return await this.gatekeeperExceptionCommand.syncGatekeeperExceptionBlocks();
  }


  protected async checkCronAuth(apiKey: string): Promise<boolean> {
    const user = (await this.userDao.loadUserByApiKey(apiKey))?.[0];
    return !!user && this.authService.checkAuthority(user.authorities, [AuthorityId.CRON]);
  }
}