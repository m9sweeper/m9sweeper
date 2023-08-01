import {Component, OnInit, ViewChild, OnDestroy} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {ClusterService} from '../../../../../core/services/cluster.service';
import {ICluster} from '../../../../../core/entities/ICluster';
import {MatDialog} from '@angular/material/dialog';
import {ClusterEditComponent} from '../cluster-edit/cluster-edit.component';
import {AlertDialogComponent} from '../../../../shared/alert-dialog/alert-dialog.component';
import {MatSlideToggle, MatSlideToggleChange} from '@angular/material/slide-toggle';
import { AlertService } from 'src/app/core/services/alert.service';
import {AddClusterWizardComponent} from '../add-cluster-wizard/add-cluster-wizard.component';
import {InfoService} from '../../../../../core/services/info.service';
import {map, take, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {JwtAuthService} from '../../../../../core/services/jwt-auth.service';


@Component({
  selector: 'app-cluster-info',
  templateUrl: './cluster-info.component.html',
  styleUrls: ['./cluster-info.component.scss']
})

export class ClusterInfoComponent implements OnInit, OnDestroy {
  protected readonly unsubscribe$ = new Subject<void>();

  clusterId: number;
  cluster: ICluster;
  m9ver: string;
  commitSHA: string;
  buildDate: string;
  isAdmin: boolean;
  isMobileDevice = false;
  isClusterLoaded = false;
  isEnforcementEnabled = false;
  isImageScanningEnforcementEnabled = false;
  azureColorSchema = ['#004C1A', '#AA0000', '#2F6C71', '#B600A0', '#008272', '#001E51', '#004B51'];
  @ViewChild('matSlideToggle') matSlideToggle: MatSlideToggle;
  @ViewChild('matSlideToggleForImageScanning') matSlideToggleForImageScanning: MatSlideToggle;

  awaitingWebhookEnforcementResponse = false;
  awaitingImageScanningEnforcementResponse = false;

  constructor(
    private alertService: AlertService,
    private breakpointObserver: BreakpointObserver,
    private clusterService: ClusterService,
    private dialog: MatDialog,
    private infoService: InfoService,
    private jwtAuthService: JwtAuthService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.isAdmin = this.jwtAuthService.isAdmin();
  }

  ngOnInit(): void {
    this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.XSmall])
      .pipe(
        map(result => result.matches),
        takeUntil(this.unsubscribe$)
      ).subscribe((newIsHandsetOrXS) => {
        this.isMobileDevice = newIsHandsetOrXS;
      });
    this.route.parent.params.subscribe(params => {
      this.clusterService.getClusterById(params.id).subscribe(response => {
        this.isClusterLoaded = true;
        this.cluster = response.data;
        this.isEnforcementEnabled = this.cluster.isEnforcementEnabled;

        this.infoService.getDatabaseStatus().pipe(take(1)).subscribe(res => {
          this.m9ver = res.data.git_tag;
          this.commitSHA = res.data.git_sha;
          this.buildDate = res.data.build_date;
        });
      });
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getClusterById(clusterId: number) {
    this.clusterService.getClusterById(clusterId).subscribe(response => {
      this.cluster = response.data;
    });
  }

  openClusterDialog(cluster: any) {
    const openAddCluster = this.dialog.open(ClusterEditComponent, {
      width: '600px',
      height: this.isMobileDevice ? '300px' : 'auto',
      closeOnNavigation: true,
      disableClose: true,
      data: {
        clusterId: cluster.id,
        groupId: cluster.groupId,
        name: cluster.name,
        tags: cluster.tags,
        gracePeriodDays: cluster.gracePeriodDays,
        isEdit: true
      }
    });
    openAddCluster.afterClosed().pipe(take(1)).subscribe(result => {
      if (result === undefined) {
        this.getClusterById(cluster.id);
      }
    });
  }

  alertDeleteCluster(id: number, groupId: number) {
    const openAddCluster = this.dialog.open(AlertDialogComponent, {
      width: '400px',
      closeOnNavigation: true,
      disableClose: true,
      data: {
        functionToRun: this.clusterService.deleteClusterById(id),
        afterRoute: ['/private/dashboard/group', groupId]
      }
    });
    openAddCluster.afterClosed().pipe(take(1)).subscribe(result => {
      // this.router.navigate(['/private/dashboard/group', groupId]);
    });
  }

  calculateMenuColor(rowIndex: number) {
    if (rowIndex < 5) {
      return this.azureColorSchema[rowIndex];
    }
    return this.azureColorSchema[rowIndex % 7];
  }

  changeEnforcementValue($event: MatSlideToggleChange) {
    const changedValue = $event.checked;
    this.cluster.isEnforcementEnabled = changedValue;
    const displayText = changedValue ? 'enabled' : 'disabled';
    this.awaitingWebhookEnforcementResponse = true;
    this.clusterService.updateCluster(this.cluster, this.cluster.id).subscribe(response => {
        this.awaitingWebhookEnforcementResponse = false;
        if (response.success) {
          this.alertService.success(`Webhook Enforcement has been ${displayText}.`);
        }
      },
      error => {
        this.awaitingWebhookEnforcementResponse = false;
        this.alertService.danger('Could not update Webhook Enforcement');
        setTimeout(() => {
          this.matSlideToggle.toggle();
        }, 1000);
      });
  }

  changeImageScanningEnforcementValue($event: MatSlideToggleChange) {
    const changedValue = $event.checked;
    this.cluster.isImageScanningEnforcementEnabled = changedValue;
    const displayText = changedValue ? 'enabled' : 'disabled';
    this.awaitingImageScanningEnforcementResponse = true;
    this.clusterService.updateCluster(this.cluster, this.cluster.id).subscribe(clusterUpdateResponse => {
        this.awaitingImageScanningEnforcementResponse = false;
        if (clusterUpdateResponse.success) {
          this.alertService.success(`Image Scanning Enforcement has been ${displayText}.`);
        }
      },
      error => {
        this.awaitingImageScanningEnforcementResponse = false;
        this.alertService.danger('Something went wrong while saving Image Scanning Enforcement.');
        setTimeout(() => {
          this.matSlideToggle.toggle();
        }, 1000);
      });
  }

  openClusterWizard() {
    const openAddCluster = this.dialog.open(AddClusterWizardComponent, {
      width: '900px',
      height: '75%',
      minHeight: '300px',
      closeOnNavigation: true,
      disableClose: true,
      data: { cluster: this.cluster, clusterId: this.cluster.id, isEdit: true }
    });
    openAddCluster.afterClosed().pipe(take(1)).subscribe(response => {
      if (response && response?.result === true) {
        this.router.navigate(['/private/clusters', this.cluster.id, 'summary']);
      }
    });
  }
}
