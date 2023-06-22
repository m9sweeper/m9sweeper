import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CreateUserComponent } from './pages/user/create-user-form/create-user.component';
import { UserListComponent } from './pages/user/user-list/user-list.component';
import { ClusterEditComponent } from './pages/cluster/cluster-edit/cluster-edit.component';
import { PrivateRoutingModule } from './private-routing.module';
import { PrivateComponent } from './private.component';
import { CreateImageComponent } from './pages/image/create-image-form/create-image.component';
import { ClusterGroupCreateComponent } from './pages/cluster-group/cluster-group-create/cluster-group-create.component';
import { ClusterDetailsComponent } from './pages/cluster/cluster-details/cluster-details.component';
import { ClusterListComponent } from './pages/cluster/cluster-list/cluster-list.component';
import { ClusterInfoComponent } from './pages/cluster/cluster-info/cluster-info.component';
import { ClusterSummaryComponent } from './pages/cluster/cluster-summary/cluster-summary.component';
import { OrganizationSettingsComponent } from './pages/organization-settings/organization-settings.component';
import { PolicyListComponent } from './pages/policies/policy-list/policy-list.component';
import { PolicyCreateComponent } from './pages/policies/policy-create/policy-create.component';
import { ScannerCreateComponent } from './pages/scanners/scanner-create/scanner-create.component';
import { ScannerListComponent } from './pages/scanners/scanner-list/scanner-list.component';
import { AppSettingsComponent } from './pages/app-settings/app-settings.component';
import { CreateAppSettingsComponent } from './pages/app-settings/create-app-settings/create-app-settings.component';
import { SubNavigationComponent } from '../shared/subnavigation/sub-navigation.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { ExternalAuthConfigurationListComponent } from './pages/external-auth-configuration/external-auth-configuration-list/external-auth-configuration-list.component';
import { ExternalAuthConfigurationCreateComponent } from './pages/external-auth-configuration/external-auth-configuration-create/external-auth-configuration-create.component';
import { UserProfileImageDirective } from '../shared/directives/user-profile-image.directive';
import { SharedModule } from '../shared/shared.module';
import { UpdateUserProfileComponent } from './pages/user/update-user-profile/update-user-profile.component';
import { DockerRegistriesCreateComponent } from './pages/docker-registries/docker-registries-create/docker-registries-create.component';
import { DockerRegistriesListComponent } from './pages/docker-registries/docker-registries-list/docker-registries-list.component';
import { ImageComponent } from './pages/image/images-list/image.component';
import { ImageScanResultComponent } from './pages/image/image-scan-result/image-scan-result.component';
import { KubernetesNamespacesComponent } from './pages/cluster/kubernetes-namespaces/kubernetes-namespaces.component';
import { MatNativeDateModule } from '@angular/material/core';
import { KubernetesPodsComponent } from './pages/cluster/kubernetes-pods/kubernetes-pods.component';
import { KubernetesDeploymentsComponent } from './pages/cluster/kubernetes-deployments/kubernetes-deployments.component';
import { KubernetesImagesComponent } from './pages/cluster/kubernetes-images/kubernetes-images.component';
import { ImageScanResultScannerDetailsComponent } from './pages/image/image-scan-result-scanner-details/image-scan-result-scanner-details.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { ApiKeyListComponent } from './pages/api-key-management/api-key-list/api-key-list.component';
import { ApiKeyFormComponent } from './pages/api-key-management/api-key-form/api-key-form.component';
import { ClusterEventComponent } from './pages/cluster/cluster-event/cluster-event.component';
import { ExceptionCreateComponent } from './pages/exceptions/exception-create/exception-create.component';
import { ExceptionListComponent } from './pages/exceptions/exception-list/exception-list.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ExceptionDetailsComponent } from './pages/exceptions/exception-details/exception-details.component';
import { AddClusterWizardComponent } from './pages/cluster/add-cluster-wizard/add-cluster-wizard.component';
import { MatStepperModule } from '@angular/material/stepper';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GateKeeperComponent } from './pages/cluster/gate-keeper/gate-keeper.component';
import { GateKeeperDetailsComponent } from './pages/cluster/gate-keeper-details/gate-keeper-details.component';
import { KubernetesPodDetailsComponent } from './pages/cluster/kubernetes-pod-details/kubernetes-pod-details.component';
import { MatSliderModule } from '@angular/material/slider';
import { LicensesComponent } from './pages/license/licenses/licenses.component';
import { LicenseCheckComponent } from './pages/license/license-check/license-check.component';
import { AddConstraintDialogComponent } from './pages/cluster/add-constraint-dialog/add-constraint-dialog.component';
import { AddCustomConstraintTemplateComponent } from './pages/cluster/add-custom-constraint-template/add-custom-constraint-template.component';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { AddTemplateConstraintComponent } from './pages/cluster/add-template-constraint/add-template-constraint.component';
import { AddConstraintCriteriaComponent } from './pages/cluster/add-constraint-criteria/add-constraint-criteria.component';
import { TemplateConstraintManifestComponent } from './pages/cluster/template-constraint-manifest/template-constraint-manifest.component';
import { KubesecComponent } from './pages/cluster/kubesec/kubesec.component';
import { ServiceAccountWizardComponent } from './pages/cluster/service-account-wizard/service-account-wizard.component';
import { MaterialDesignFrameworkModule } from '@ajsf/material';
import { JsonSchemaFormModule } from '@ajsf/core';
import { KubeHunterComponent } from './pages/cluster/kube-hunter/kube-hunter.component';
import { KubeHunterDialogComponent } from './pages/cluster/kube-hunter/kube-hunter-dialog/kube-hunter-dialog.component';
import { KubeHunterReportDetailsComponent } from './pages/cluster/kube-hunter/kube-hunter-report-details/kube-hunter-report-details.component';
import { ImageIssueMoreDataDialogComponent } from './pages/image/image-issue-more-data-dialog/image-issue-more-data-dialog.component';
import { SafeHtmlPipe } from '../../core/pipe/safe-html.pipe';
import { KubeBenchComponent } from './pages/cluster/kube-bench/kube-bench.component';
import { KubeBenchReportDetailsComponent } from './pages/cluster/kube-bench/kube-bench-report-details/kube-bench-report-details.component';
import { KubeBenchDialogComponent } from './pages/cluster/kube-bench/kube-bench-dialog/kube-bench-dialog.component';
import { MatExpansionModule } from '@angular/material/expansion';
import {KubeBenchDeleteReportDialogComponent} from './pages/cluster/kube-bench/kube-bench-delete-report-dialog/kube-bench-delete-report-dialog.component';
import { KubesecDialogComponent } from './pages/cluster/kubesec/kubesec-dialog/kubesec-dialog.component';
import { KubesecAggregateDialogComponent } from './pages/cluster/kubesec/kubesec-aggregate-table-dialog/kubesec-aggregate-dialog.component';
import { GatekeeperViolationDialogComponent } from './pages/cluster/gatekeeper-violation-dialog/gatekeeper-violation-dialog.component';
import { AdvancedSearchDialogComponent } from './pages/image/images-list/advanced-search-dialog/advanced-search-dialog.component';
import { ConfirmScanAllDialogComponent } from './pages/image/images-list/confirm-scan-all-dialog/confirm-scan-all-dialog.component';
import { ReportsComponent } from './pages/reports/reports-list/reports.component';
import { VulnerabilityExportComponent } from './pages/reports/vulnerability-export/vulnerability-export.component';
import { RunningVulnerabilitiesComponent } from './pages/reports/running-vulnerabilities/running-vulnerabilities.component';
import { VulnerabilityVisualizationComponent } from './pages/reports/vulnerability-visualization/vulnerability-visualization.component';
import { HistoricalVulnerabilitiesComponent } from './pages/reports/historical-vulnerabilities/historical-vulnerabilities.component';
import { WorstImagesComponent } from './pages/reports/worst-images/worst-images.component';
import { AuditLogComponent } from './pages/audit-log/audit-log-list/audit-log.component';
import { ShowJsonDataComponent } from '../../core/dialogues/show-json-data/show-json-data.component';
import { DockerRegistryAuthTypePipe } from '../../core/pipe/docker-registry-auth-type.pipe';
import {
  VulnerabilityDifferenceOverTimeComponent
} from './pages/reports/vulnerability-difference-over-time/vulnerability-difference-over-time.component';
import {
  VulnerabilityDifferenceByDateComponent
} from './pages/reports/vulnerability-difference-by-date/vulnerability-difference-by-date.component';
import {FalcoEventsListComponent} from './pages/falco/falco-events-list/falco-events-list.component';
import {FalcoDialogComponent} from './pages/falco/falco-dialog/falco-dialog.component';
import {ShowJsonDataMoreComponent} from '../../core/dialogues/show-json-data-more/show-json-data-more.component';
import {ShareEventComponent} from '../../core/dialogues/show-json-data-more/share-event.component';
import {FalcoSettingsComponent} from './pages/falco/falco-settings/falco-settings.component';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {TablifyPipe} from '../../core/pipe/tablify.pipe';
import {GateKeeperInstallWizardDialogComponent} from './pages/cluster/gate-keeper-install-wizard-dialog/gate-keeper-install-wizard-dialog.component';
import { FalcoRuleComponent } from './pages/falco/falco-settings/falco-rule/falco-rule.component';
import { FalcoRuleAddEditDialogComponent } from './pages/falco/falco-settings/falco-rule-add-edit-dialog/falco-rule-add-edit-dialog.component';


@NgModule({
  declarations: [
    PrivateComponent,
    DashboardComponent,
    CreateImageComponent,
    CreateUserComponent,
    UserListComponent,
    ClusterEditComponent,
    ClusterGroupCreateComponent,
    ClusterDetailsComponent,
    ClusterListComponent,
    ClusterInfoComponent,
    ClusterSummaryComponent,
    OrganizationSettingsComponent,
    PolicyListComponent,
    PolicyCreateComponent,
    ScannerCreateComponent,
    ScannerListComponent,
    AppSettingsComponent,
    CreateAppSettingsComponent,
    SubNavigationComponent,
    ChangePasswordComponent,
    ExternalAuthConfigurationListComponent,
    ExternalAuthConfigurationCreateComponent,
    UserProfileImageDirective,
    UpdateUserProfileComponent,
    DockerRegistriesCreateComponent,
    DockerRegistriesListComponent,
    ImageComponent,
    ImageScanResultComponent,
    KubernetesNamespacesComponent,
    KubernetesPodsComponent,
    KubernetesPodDetailsComponent,
    KubernetesDeploymentsComponent,
    KubernetesImagesComponent,
    ImageScanResultScannerDetailsComponent,
    ApiKeyListComponent,
    ApiKeyFormComponent,
    ClusterEventComponent,
    ExceptionListComponent,
    ExceptionCreateComponent,
    ExceptionDetailsComponent,
    FalcoEventsListComponent,
    FalcoDialogComponent,
    FalcoSettingsComponent,
    AddClusterWizardComponent,
    GateKeeperComponent,
    GateKeeperDetailsComponent,
    GateKeeperInstallWizardDialogComponent,
    LicensesComponent,
    LicenseCheckComponent,
    AddConstraintDialogComponent,
    AddCustomConstraintTemplateComponent,
    AddTemplateConstraintComponent,
    AddConstraintCriteriaComponent,
    TemplateConstraintManifestComponent,
    KubesecComponent,
    ServiceAccountWizardComponent,
    KubeHunterComponent,
    KubeHunterDialogComponent,
    KubeHunterReportDetailsComponent,
    ImageIssueMoreDataDialogComponent,
    SafeHtmlPipe,
    TablifyPipe,
    KubeBenchComponent,
    KubeBenchReportDetailsComponent,
    KubeBenchDialogComponent,
    KubeBenchDeleteReportDialogComponent,
    KubesecDialogComponent,
    KubesecAggregateDialogComponent,
    GatekeeperViolationDialogComponent,
    AdvancedSearchDialogComponent,
    ConfirmScanAllDialogComponent,
    ReportsComponent,
    VulnerabilityExportComponent,
    RunningVulnerabilitiesComponent,
    VulnerabilityVisualizationComponent,
    HistoricalVulnerabilitiesComponent,
    WorstImagesComponent,
    AuditLogComponent,
    ShowJsonDataComponent,
    ShowJsonDataMoreComponent,
    ShareEventComponent,
    DockerRegistryAuthTypePipe,
    VulnerabilityDifferenceOverTimeComponent,
    VulnerabilityDifferenceByDateComponent,
    FalcoRuleComponent,
    FalcoRuleAddEditDialogComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PrivateRoutingModule,
    MatToolbarModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatGridListModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatRadioModule,
    MatSelectModule,
    MatMenuModule,
    MatDialogModule,
    MatChipsModule,
    NgxChartsModule,
    MatAutocompleteModule,
    MatSlideToggleModule,
    MatTabsModule,
    SharedModule,
    MatNativeDateModule,
    FontAwesomeModule,
    InfiniteScrollModule,
    MatTooltipModule,
    MatStepperModule,
    MatProgressSpinnerModule,
    NgxUiLoaderModule,
    MatSliderModule,
    CodemirrorModule,
    MaterialDesignFrameworkModule,
    JsonSchemaFormModule,
    MatExpansionModule,
    MatButtonToggleModule,
  ],
  providers: [
    DatePipe
  ],
})
export class PrivateModule {
}
