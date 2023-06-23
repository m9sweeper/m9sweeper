import {Component, OnInit, HostListener, ViewChild} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {ClusterService} from '../../../../../core/services/cluster.service';
import {ICluster} from '../../../../../core/entities/ICluster';
import {MatDialog} from '@angular/material/dialog';
import {ClusterEditComponent} from '../cluster-edit/cluster-edit.component';
import {AlertDialogComponent} from '../../../../shared/alert-dialog/alert-dialog.component';
import {MatSlideToggle, MatSlideToggleChange} from '@angular/material/slide-toggle';
import { AlertService } from '@full-fledged/alerts';
import {ILicense} from '../../../../../core/entities/ILicense';
import {LicenseFeatures} from '../../../../../core/enum/LicenseFeatures';
import {AddClusterWizardComponent} from '../add-cluster-wizard/add-cluster-wizard.component';
import {InfoService} from '../../../../../core/services/info.service';
import {take} from 'rxjs/operators';


@Component({
  selector: 'app-cluster-info',
  templateUrl: './cluster-info.component.html',
  styleUrls: ['./cluster-info.component.scss']
})

export class ClusterInfoComponent implements OnInit {
  clusterId: number;
  cluster: ICluster;
  m9ver: string;
  commitSHA: string;
  buildDate: string;
  width: number;
  isMobileDevice = false;
  isClusterLoaded = false;
  isEnforcementEnabled = false;
  isImageScanningEnforcementEnabled = false;
  azureColorSchema = ['#004C1A', '#AA0000', '#2F6C71', '#B600A0', '#008272', '#001E51', '#004B51'];
  @ViewChild('matSlideToggle') matSlideToggle: MatSlideToggle;
  @ViewChild('matSlideToggleForImageScanning') matSlideToggleForImageScanning: MatSlideToggle;
  constructor(private clusterService: ClusterService,
              private infoService: InfoService,
              private router: Router,
              private route: ActivatedRoute,
              private dialog: MatDialog,
              private alertService: AlertService) {
  }

  ngOnInit(): void {
    this.width = window.innerWidth;
    this.screenSizeCollapse(this.width);
    this.route.parent.params.subscribe(params => {
      this.clusterService.getClusterById(params.id).subscribe(response => {
        this.isClusterLoaded = true;
        this.cluster = response.data;
        this.isEnforcementEnabled = this.cluster.isEnforcementEnabled;

        this.clusterService.checkLicenseValidity().subscribe(licenseValidityResponse => {
          const licenseData: ILicense = licenseValidityResponse.data.data;
          const featureNames = licenseData ? licenseData.features.map(feature => feature.name) : [];
          const licenseHasImageScanningEnforcement = featureNames.includes(LicenseFeatures.IMAGE_SCANNING_ENFORCEMENT);
          if (licenseHasImageScanningEnforcement && this.cluster.isImageScanningEnforcementEnabled) {
            this.isImageScanningEnforcementEnabled = true;
          }
        });
        this.infoService.getDatabaseStatus().pipe(take(1)).subscribe(res => {
          this.m9ver = res.data.git_tag;
          this.commitSHA = res.data.git_sha;
          this.buildDate = res.data.build_date;
        });
      });
    });
  }

  @HostListener('window:resize', ['$event'])
  calculateScreenSize($event?: any) {
    this.scrWidth = window.innerWidth;
    this.screenSizeCollapse(this.scrWidth);
  }

  set scrWidth(val: number) {
    if (val !== this.width) {
      this.width = val;
    }
  }

  get scrWidth(): number {
    return this.width;
  }

  screenSizeCollapse(width: number) {
    this.isMobileDevice = width < 500;
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
    openAddCluster.afterClosed().subscribe(result => {
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
    openAddCluster.afterClosed().subscribe(result => {
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
    this.clusterService.updateCluster(this.cluster, this.cluster.id).subscribe(response => {
        if (response.success) {
          this.alertService.success(`Webhook Enforcement has been ${displayText}.`);
        }
      },
      error => {
        this.alertService.danger('Could not update Webhook Enforcement');
        setTimeout(() => {
          this.matSlideToggle.toggle();
        }, 1000);
      });
  }

  changeImageScanningEnforcementValue($event: MatSlideToggleChange) {
    const changedValue = $event.checked;
    const displayText = changedValue ? 'enabled' : 'disabled';
    this.cluster.isImageScanningEnforcementEnabled = changedValue;
    this.clusterService.updateCluster(this.cluster, this.cluster.id).subscribe(clusterUpdateResponse => {
        if (clusterUpdateResponse.success) {
          this.alertService.success(`Image Scanning Enforcement has been ${displayText}.`);
        }
      },
      error => {
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
    openAddCluster.afterClosed().subscribe(response => {
      if (response && response?.result === true) {
        console.log(response);
        this.router.navigate(['/private/clusters', this.cluster.id, 'summary']);
      }
    });
  }
}
