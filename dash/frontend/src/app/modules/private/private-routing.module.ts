import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PrivateComponent} from './private.component';
import {DashboardComponent} from './pages/dashboard/dashboard.component';
import {CreateUserComponent} from './pages/user/create-user-form/create-user.component';
import {UserListComponent} from './pages/user/user-list/user-list.component';
import {ClusterDetailsComponent} from './pages/cluster/cluster-details/cluster-details.component';
import {ClusterListComponent} from './pages/cluster/cluster-list/cluster-list.component';
import {ClusterSummaryComponent} from './pages/cluster/cluster-summary/cluster-summary.component';
import {ClusterInfoComponent} from './pages/cluster/cluster-info/cluster-info.component';
import {OrganizationSettingsComponent} from './pages/organization-settings/organization-settings.component';
import {PolicyListComponent} from './pages/policies/policy-list/policy-list.component';
import {PolicyCreateComponent} from './pages/policies/policy-create/policy-create.component';
import {ChangePasswordComponent} from './pages/change-password/change-password.component';
import {ExternalAuthConfigurationListComponent} from './pages/external-auth-configuration/external-auth-configuration-list/external-auth-configuration-list.component';
import {Authority} from '../../core/enum/Authority';
import {RoleGuard} from '../../core/route-guards/role.guard';
import {DockerRegistriesListComponent} from './pages/docker-registries/docker-registries-list/docker-registries-list.component';
import {DockerRegistriesCreateComponent} from './pages/docker-registries/docker-registries-create/docker-registries-create.component';
import {ImageScanResultComponent} from './pages/image/image-scan-result/image-scan-result.component';
import {ImageComponent} from './pages/image/images-list/image.component';
import {ImageScanResultScannerDetailsComponent} from './pages/image/image-scan-result-scanner-details/image-scan-result-scanner-details.component';
import {KubernetesNamespacesComponent} from './pages/cluster/kubernetes-namespaces/kubernetes-namespaces.component';
import {KubernetesPodsComponent} from './pages/cluster/kubernetes-pods/kubernetes-pods.component';
import {ApiKeyListComponent} from './pages/api-key-management/api-key-list/api-key-list.component';
import {ApiKeyFormComponent} from './pages/api-key-management/api-key-form/api-key-form.component';
import {ExceptionListComponent} from './pages/exceptions/exception-list/exception-list.component';
import {ExceptionCreateComponent} from './pages/exceptions/exception-create/exception-create.component';
import {ExceptionDetailsComponent} from './pages/exceptions/exception-details/exception-details.component';
import {GateKeeperComponent} from './pages/cluster/gate-keeper/gate-keeper.component';
import {GateKeeperDetailsComponent} from './pages/cluster/gate-keeper-details/gate-keeper-details.component';
import {KubernetesPodDetailsComponent} from './pages/cluster/kubernetes-pod-details/kubernetes-pod-details.component';
import {KubesecComponent} from './pages/cluster/kubesec/kubesec.component';
import {KubeHunterReportDetailsComponent} from './pages/cluster/kube-hunter/kube-hunter-report-details/kube-hunter-report-details.component';
import {KubeHunterComponent} from './pages/cluster/kube-hunter/kube-hunter.component';
import {KubeBenchComponent} from './pages/cluster/kube-bench/kube-bench.component';
import {KubeBenchReportDetailsComponent} from './pages/cluster/kube-bench/kube-bench-report-details/kube-bench-report-details.component';
import { ReportsComponent } from './pages/reports/reports-list/reports.component';
import { VulnerabilityExportComponent } from './pages/reports/vulnerability-export/vulnerability-export.component';
import { RunningVulnerabilitiesComponent } from './pages/reports/running-vulnerabilities/running-vulnerabilities.component';
import { VulnerabilityVisualizationComponent } from './pages/reports/vulnerability-visualization/vulnerability-visualization.component';
import {HistoricalVulnerabilitiesComponent} from './pages/reports/historical-vulnerabilities/historical-vulnerabilities.component';
import { WorstImagesComponent } from './pages/reports/worst-images/worst-images.component';
import {AuditLogComponent} from './pages/audit-log/audit-log-list/audit-log.component';
import {
  VulnerabilityDifferenceOverTimeComponent
} from './pages/reports/vulnerability-difference-over-time/vulnerability-difference-over-time.component';
import {
  VulnerabilityDifferenceByDateComponent
} from './pages/reports/vulnerability-difference-by-date/vulnerability-difference-by-date.component';
import {FalcoEventsListComponent} from './pages/falco/falco-events-list/falco-events-list.component';
import {FalcoEventDetailsComponent} from './pages/falco/falco-event-details/falco-event-details.component';
import {FalcoSettingsComponent} from './pages/falco/falco-settings/falco-settings.component';
import {FalcoOrgSettingsPageComponent} from './pages/falco/falco-org-settings-page/falco-org-settings-page.component';
import {SecurityAuditReportComponent} from './pages/reports/security-audit-report/security-audit-report.component';

const routes: Routes = [
  {
    path: '',
    component: PrivateComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full'},
      {
        path: 'dashboard',
        component: DashboardComponent,
        children: [
          {
            path: 'group/:groupId',
            component: ClusterListComponent,
            data: {
              title: 'm9sweeper'
            }
          }
        ]
      },
      {
        path: 'clusters/:id',
        component: ClusterDetailsComponent,
        canActivate: [RoleGuard],
        data: {
          allowedUserRoles: [Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY]
        },
        children: [
          {
            path: 'summary',
            component: ClusterSummaryComponent,
            data: {
              title: 'Cluster Summary'
            }
          },
          {
            path: 'info',
            component: ClusterInfoComponent,
            data: {
              title: 'Cluster Info'
            }
          },
          {
            path: 'images',
            children: [
              {
                path: '',
                component: ImageComponent,
                data: {
                  title: 'Images'
                }
              },
              {
                path: 'image-scan/:imageId',
                component: ImageScanResultComponent,
                data: {
                  title: 'Scan result'
                }
              },
              {
                path: 'image-scan/:imageId/scanner/:scannerId',
                component: ImageScanResultScannerDetailsComponent,
                data: {
                  title: 'Scan result'
                }
              }
            ]
          },
          {
            path: 'falco',
            children: [
              {
                path: '',
                component: FalcoEventsListComponent,
                data: {
                  title: 'Project Falco'
                }
              },
              {
                path: 'more/:eventId/signature/:signature',
                component: FalcoEventDetailsComponent,
                data: {
                  title: 'Project Falco Detail Logs'
                }
              },
              {
                path: 'settings',
                component: FalcoSettingsComponent,
                canActivate: [RoleGuard],
                data: {
                  title: 'Project Falco Settings',
                  allowedUserRoles: [Authority.SUPER_ADMIN, Authority.ADMIN]
                },
              }
            ]
          },
          {
            path: 'reports',
            children: [
              {
                path: '',
                component: ReportsComponent,
                data: {
                  title: 'Vulnerability Reports'
                }
              },
              {
                path: 'vulnerability-export',
                component: VulnerabilityExportComponent,
                data: {
                  title: 'Vulnerability Export'
                }
              },
              {
                path: 'running-vulnerabilities',
                component: RunningVulnerabilitiesComponent,
                data: {
                  title: 'Running Vulnerabilities'
                }
              },
              {
                path: 'vulnerability-visualization',
                component: VulnerabilityVisualizationComponent,
                data: {
                  title: 'Vulnerability Visualization'
                }
              },
              {
                path: 'historical-vulnerabilities',
                component: HistoricalVulnerabilitiesComponent,
                data: {
                  title: 'Historical Vulnerabilities'
                }
              },
              {
                path: 'worst-images',
                component: WorstImagesComponent,
                data: {
                  title: 'Worst Images'
                }
              },
              {
                path: 'vulnerability-difference-over-time',
                component: VulnerabilityDifferenceOverTimeComponent,
                data: {
                  title: 'Vulnerability Differences Over Time'
                }
              },
              {
                path: 'vulnerability-difference-by-date',
                component: VulnerabilityDifferenceByDateComponent,
                data: {
                  title: 'Vulnerability Difference By Date'
                }
              },
              {
                path: 'security-audit-report',
                component: SecurityAuditReportComponent,
                data: {
                  title: 'Security Audit Report'
                }
              }
            ]
          },
          {
            path: 'kubernetes-namespaces',
            children: [
              {
                path: '',
                component: KubernetesNamespacesComponent,
                data: {
                  title: 'Namespaces Info'
                },
              },
              {
                path: ':namespace/pods',
                children: [
                  {
                    path: '',
                    component: KubernetesPodsComponent,
                    data: {
                      title: 'Kubernetes Pods'
                    }
                  },
                  {
                    path: ':pod',
                    children: [
                      {
                        path: '',
                        component: KubernetesPodDetailsComponent,
                        data: {
                          title: 'Kubernetes Pod Info'
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            path: 'gatekeeper',
            component: GateKeeperComponent,
            data: {
              title: 'Gatekeeper Constraints'
            }
          },
          {
            path: 'gatekeeper/:templateName',
            component: GateKeeperDetailsComponent,
            data: {
              title: 'Template Details'
            }
          },
          {
            path: 'kubesec',
            component: KubesecComponent,
            data: {
              title: 'Kubesec'
            }
          },
          {
            path: 'kubehunter',
            component: KubeHunterComponent,
            data: {
              title: 'kube-hunter'
            }
          },
          {
            path: 'kubehunter/:id',
            component: KubeHunterReportDetailsComponent,
            data: {
              title: 'kube-hunter Report Details'
            }
          },
          {
            path: 'kubebench',
            component: KubeBenchComponent,
            data: {
              title: 'kube-bench'
            }
          },
          {
            path: 'kubebench/:id',
            component: KubeBenchReportDetailsComponent,
            data: {
              title: 'kube-bench Report Details'
            }
          },
        ]
      },
      {
        path: 'users', component: OrganizationSettingsComponent,
        canActivateChild: [RoleGuard],
        data: {
          allowedUserRoles: [Authority.SUPER_ADMIN, Authority.ADMIN]
        },
        children: [
          {
            path: '',
            component: UserListComponent,
            data: {
              title: 'Users'
            }
          },
          {
            path: 'create',
            component: CreateUserComponent,
            canActivate: [RoleGuard],
            data: {
              title: 'Create User',
              allowedUserRoles: [Authority.SUPER_ADMIN, Authority.ADMIN]
            }
          },
          {
            path: 'edit/:id',
            component: CreateUserComponent,
            canActivate: [RoleGuard],
            data: {
              title: 'Edit user',
              allowedUserRoles: [Authority.SUPER_ADMIN, Authority.ADMIN]
            }
          }
        ]
      },
      {
        path: 'single-sign-on', component: OrganizationSettingsComponent,
        canActivate: [RoleGuard],
        data: {
          allowedUserRoles: [Authority.SUPER_ADMIN]
        },
        children: [
          {
            path: '',
            component: ExternalAuthConfigurationListComponent,
            data: {
              title: 'External Auth'
            }
          },
        ]
      },
      {
        path: 'policies',
        component: OrganizationSettingsComponent,
        canActivateChild: [RoleGuard],
        data: {
          allowedUserRoles: [Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY]
        },
        children: [
          {
            path: '',
            component: PolicyListComponent,
            data: {
              title: 'Policies',
            }
          },
          {
            path: 'create',
            component: PolicyCreateComponent,
            canActivate: [RoleGuard],
            data: {
              title: 'Create Policy',
              allowedUserRoles: [Authority.SUPER_ADMIN, Authority.ADMIN]
            }
          },
          {
            path: ':id/edit',
            component: PolicyCreateComponent,
            canActivate: [RoleGuard],
            data: {
              title: 'Edit Policy',
              allowedUserRoles: [Authority.SUPER_ADMIN, Authority.ADMIN]
            }
          }
        ]
      },
      {
        path: 'exceptions',
        component: OrganizationSettingsComponent,
        canActivateChild: [RoleGuard],
        data: {
          allowedUserRoles: [Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY]
        },
        children: [
          {
            path: '',
            component: ExceptionListComponent,
            data: {
              title: 'Exceptions',
            }
          },
          {
            path: 'create',
            component: ExceptionCreateComponent,
            canActivate: [RoleGuard],
            data: {
              title: 'Create Exception',
              allowedUserRoles: [Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY]
            }
          },
          {
            path: ':id',
            component: ExceptionDetailsComponent,
            data: {
              title: 'Exception Details',
              allowedUserRoles: [Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY]
            }
          },
          {
            path: ':id/edit',
            component: ExceptionCreateComponent,
            canActivate: [RoleGuard],
            data: {
              title: 'Edit Exception',
              allowedUserRoles: [Authority.SUPER_ADMIN, Authority.ADMIN]
            }
          },
        ]
      },
      {
        path: 'falco',
        component: OrganizationSettingsComponent,
        canActivateChild: [RoleGuard],
        data: {
          allowedUserRoles: [Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY]
        },
        children: [{
          path: '',
          component: FalcoOrgSettingsPageComponent,
          data: {
            title: 'Falco Settings',
          }
        }]
      },
      {
        path: 'change-password',
        component: ChangePasswordComponent
      },
      {
        path: 'docker-registries',
        component: OrganizationSettingsComponent,
        canActivateChild: [RoleGuard],
        data: {
          allowedUserRoles: [Authority.SUPER_ADMIN, Authority.ADMIN, Authority.READ_ONLY]
        },
        children: [
          {
            path: '',
            component: DockerRegistriesListComponent,
            data: {
              title: 'Docker Registries',
            }
          },
          {
            path: 'create',
            component: DockerRegistriesCreateComponent,
            canActivate: [RoleGuard],
            data: {
              title: 'Create Docker Registries',
              allowedUserRoles: [Authority.SUPER_ADMIN, Authority.ADMIN]
            }
          },
          {
            path: 'edit/:id',
            component: DockerRegistriesCreateComponent,
            canActivate: [RoleGuard],
            data: {
              title: 'Edit Docker Registry',
              allowedUserRoles: [Authority.SUPER_ADMIN, Authority.ADMIN]
            }
          }
        ]
      },
      {
        path: 'api-key',
        component: OrganizationSettingsComponent,
        canActivateChild: [RoleGuard],
        data: {
          allowedUserRoles: [Authority.SUPER_ADMIN]
        },
        children: [
          {
            path: '',
            component: ApiKeyListComponent,
            canActivate: [RoleGuard],
            data: {
              title: 'API Key Management',
            }
          },
          {
            path: 'create',
            component: ApiKeyFormComponent,
            canActivate: [RoleGuard],
            data: {
              title: 'API Key Management',
              allowedUserRoles: [Authority.SUPER_ADMIN]
            }
          },
          {
            path: 'edit/:id',
            component: ApiKeyFormComponent,
            canActivate: [RoleGuard],
            data: {
              title: 'Update Key Management',
              allowedUserRoles: [Authority.SUPER_ADMIN]
            }
          },
        ]
      },
      {
        path: 'audit-logs',
        component: OrganizationSettingsComponent,
        canActivateChild: [RoleGuard],
        data: {
          allowedUserRoles: [Authority.SUPER_ADMIN]
        },
        children: [
          {
            path: '',
            component: AuditLogComponent,
            canActivate: [RoleGuard],
            data: {
              title: 'Audit Logs',
            }
          },
        ]
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrivateRoutingModule {
}
