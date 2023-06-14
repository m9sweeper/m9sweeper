import { Routes } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import {SettingsModule} from './modules/settings/settings.module';
import {SharedModule} from './modules/shared/shared.module';
import {UserModule} from './modules/user/user.module';
import { TagModule } from './modules/tag/tag.module';
import { ImageModule } from './modules/image/image.module';
import { ClusterModule } from './modules/cluster/cluster.module';
import { ClusterGroupModule } from "./modules/cluster-group/cluster-group.module";
import { PolicyModule } from './modules/policy/policy.module';
import { ScannerModule } from './modules/scanner/scanner.module';
import { HealthModule } from './modules/health/health.module';
import { InfoModule } from './modules/info/info.module';
import { DockerRegistriesModule } from "./modules/docker-registries/docker-registries.module";
import { NamespaceModule } from './modules/namespace/namespace.module';
import { DeploymentModule } from './modules/deployment/deployment.module';
import { K8sImageModule } from './modules/k8s-image/k8s-image.module';
import { PodModule} from './modules/pod/pod.module';
import { ClusterEventModule } from './modules/cluster-event/cluster-event.module';
import { ImageScanResultsIssueModule } from './modules/image-scan-results-issue/image-scan-result-issue.module';
import { ClusterValidationModule } from './modules/cluster-validation/cluster-validation-module';
import { ApiKeyModule } from './modules/api-key/api-key.module';
import { ExceptionsModule } from "./modules/exceptions/exceptions.module";
import { CommentModule } from "./modules/comment/comment.module";
import {KubesecModule} from "./modules/kubesec/kubesec.module";
import {KubeHunterModule} from "./modules/kube-hunter/kube-hunter.module";
import {KubeBenchModule} from "./modules/kube-bench/kube-bench.module";
import { ReportsModule } from './modules/reports/reports.module';
import {AuditLogModule} from "./modules/audit-log/audit-log.module";
import {FalcoModule} from './modules/falco/falco.module';


export const routes: Routes = [
  {
    path: '/auth',
    module: AuthModule
  },
  {
    path: '/common',
    module: SharedModule
  },
  {
    path: '/api',
    children: [
      {
        path: '/settings',
        module: SettingsModule
      },
      {
        path: '/users',
        module: UserModule
      },
      {
        path: '/tags',
        module: TagModule
      },
      {
        path: '/clusters',
        children:[
          {
            path: '/',
            module: ClusterModule
          },
          {
            path: '/',
            module: ImageModule
          },
          {
            path: '/:clusterId/events',
            module: ClusterEventModule
          },
          {
            path: '/:clusterId/validation',
            module: ClusterValidationModule
          }
        ]
      },
      {
        path: '/images',
        module: ImageScanResultsIssueModule
      },
      {
        path: '/cluster-groups',
        module: ClusterGroupModule
      },
      {
        path: '/policies',
        module: PolicyModule
      },
      {
        path: '/exceptions',
        module: ExceptionsModule
      },
      {
        path: '/scanners',
        module: ScannerModule
      },
      {
        path: '/health',
        module: HealthModule
      },
      {
        path: '/info',
        module: InfoModule
      },
      {
        path: '/docker-registries',
        module: DockerRegistriesModule
      },
      {
        path: '/namespaces',
        module: NamespaceModule
      },
      {
        path: '/deployments',
        module: DeploymentModule
      },
      {
        path: '/k8s-images',
        module: K8sImageModule
      },
      {
        path: '/k8s-pods',
        module: PodModule
      },
      {
        path: '/api-key',
        module: ApiKeyModule
      },
      {
        path: '/comments',
        module: CommentModule
      },
      {
        path: '/kubesec',
        module: KubesecModule
      },
      {
        path: '/kube-bench',
        module: KubeBenchModule
      },
      {
        path: '/kubehunter',
        module: KubeHunterModule
      },
      {
        path: '/reports',
        module: ReportsModule
      },
      {
        path: '/audit-logs',
        module: AuditLogModule
      },
      {
        path: '/falco',
        module: FalcoModule
      }
    ]
  }
];
