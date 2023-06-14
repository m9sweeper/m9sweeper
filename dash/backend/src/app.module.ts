import { HttpModule } from '@nestjs/axios';
import { MiddlewareConsumer } from '@nestjs/common/interfaces/middleware/middleware-consumer.interface';
import { Module } from '@nestjs/common/decorators/modules/module.decorator';
import { NestModule } from '@nestjs/common/interfaces/modules/nest-module.interface';
import { RouterModule } from '@nestjs/core';
import { WinstonModule} from 'nest-winston/dist/winston.module';
import { ServeStaticModule } from '@nestjs/serve-static/dist/serve-static.module';
import { format, transports } from 'winston';
import { join } from 'path';
import { routes } from './app.module.router';
import { SharedModule } from './modules/shared/shared.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { SettingsModule } from './modules/settings/settings.module';
import { LoggerMiddleware } from './middleware/logger-middleware';
import { TagModule } from './modules/tag/tag.module';
import { ImageModule } from './modules/image/image.module';
import { ClusterModule } from './modules/cluster/cluster.module';
import { ClusterGroupModule } from './modules/cluster-group/cluster-group.module';
import { PolicyModule } from './modules/policy/policy.module';
import { ScannerModule } from './modules/scanner/scanner.module';
import { HealthModule } from "./modules/health/health.module";
import { InfoModule } from "./modules/info/info.module";
import { DockerRegistriesModule } from "./modules/docker-registries/docker-registries.module";
import { CommandLineModule } from './modules/command-line/command-line.module';
import { NamespaceModule } from './modules/namespace/namespace.module';
import { DeploymentModule } from './modules/deployment/deployment.module';
import { K8sImageModule } from './modules/k8s-image/k8s-image.module';
import { PodModule } from './modules/pod/pod.module';
import {  ClusterEventModule } from './modules/cluster-event/cluster-event.module';
import { ImageScanResultsIssueModule } from './modules/image-scan-results-issue/image-scan-result-issue.module';
import { ClusterValidationModule } from './modules/cluster-validation/cluster-validation-module';
import { ApiKeyModule } from './modules/api-key/api-key.module';
import { ExceptionsModule } from "./modules/exceptions/exceptions.module";
import { CommentModule } from "./modules/comment/comment.module";
import { ConfigModule } from '@nestjs/config';
import AppConfig from './config';
import {KubesecModule} from "./modules/kubesec/kubesec.module";
import {MulterModule} from "@nestjs/platform-express";
import {KubeBenchModule} from "./modules/kube-bench/kube-bench.module";
import {KubeHunterModule} from "./modules/kube-hunter/kube-hunter.module";
import { ReportsModule } from './modules/reports/reports.module';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import {AuditLogModule} from './modules/audit-log/audit-log.module';
import {FalcoModule} from './modules/falco/falco.module';


const myFormatter = info => {
  let formattedInfo = {
    context: info.context,
    level: info.level,
    message: ''
  };
  if (['info', 'debug', 'error'].includes(info.level)) {
    const msgData = info.message;
    info.message = typeof msgData === 'object' ? msgData.label : msgData;
    formattedInfo = {
      context: info.context,
      level: info.level,
      message: info.message
    };
    if (info.level === 'error') {
      formattedInfo['trace'] = info.trace;
    }
    formattedInfo = {...formattedInfo, ...msgData?.data};
  }
  return JSON.stringify(formattedInfo);
};

@Module({
  imports: [
    WinstonModule.forRoot({
      levels: {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        verbose: 4,
        debug: 5,
        silly: 6
      },
      // format: format.json(),
      format: format.combine(
          format.errors({ stack: true }),
          format.timestamp(),
          format.printf(myFormatter)
      ),
      exitOnError: false,
      transports: [
        // new transports.File({ filename: 'error.log', level: 'error' }),
        // new transports.File({ filename: 'combined.log' }),
        new transports.Console()
      ],
    }),
    ConfigModule.forRoot({
      load: [AppConfig],
      ignoreEnvFile: true,
      isGlobal: true,
    }),
    RouterModule.register(routes),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'public'),
    }),
    HttpModule,
    SharedModule,
    AuthModule,
    UserModule,
    SettingsModule,
    TagModule,
    ImageModule,
    ClusterModule,
    ClusterGroupModule,
    PolicyModule,
    ScannerModule,
    HealthModule,
    InfoModule,
    DockerRegistriesModule,
    CommandLineModule,
    NamespaceModule,
    DeploymentModule,
    K8sImageModule,
    PodModule,
    ClusterEventModule,
    ImageScanResultsIssueModule,
    ClusterValidationModule,
    ApiKeyModule,
    ExceptionsModule,
    CommentModule,
    KubesecModule,
    KubeBenchModule,
    MulterModule,
    KubeHunterModule,
    ReportsModule,
    AuditLogModule,
    FalcoModule,
    PrometheusModule.register({
          path: '/api/v1/metrics',
          defaultMetrics: {
            enabled: true
          },
        }),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
        .apply(LoggerMiddleware)
        .exclude('non-redirectable-login/(.*)')
        .forRoutes('*');
  }
}
