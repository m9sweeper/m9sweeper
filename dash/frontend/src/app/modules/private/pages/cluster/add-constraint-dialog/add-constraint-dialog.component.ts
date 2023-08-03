import {
  Component,
  ElementRef,
  Inject, OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import {MatSidenav} from '@angular/material/sidenav';
import {GateKeeperService} from '../../../../../core/services/gate-keeper.service';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {IGSelectedTemplate} from '../../../../../core/entities/IGatekeeperTemplate';
import {AlertService} from 'src/app/core/services/alert.service';
import {AddCustomConstraintTemplateComponent} from '../add-custom-constraint-template/add-custom-constraint-template.component';
import {MatCheckbox, MatCheckboxChange} from '@angular/material/checkbox';
import {map, take, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';

@Component({
  selector: 'app-add-constraint-dialog',
  templateUrl: './add-constraint-dialog.component.html',
  styleUrls: ['./add-constraint-dialog.component.scss']
})
export class AddConstraintDialogComponent implements OnInit, OnDestroy {
  @ViewChild('sidenav') sidenav: MatSidenav;
  @ViewChildren('checkboxes') checkboxes: QueryList<ElementRef<MatCheckbox>>;

  clusterId: number;
  topDirs: string[];
  dirStructure: { [dirName: string]: string[] };
  currentlySelectedTemplates: IGSelectedTemplate[] = [];
  isHandsetOrXS: boolean;
  sidenavExpanded = true;
  unsubscribe$ = new Subject<void>();

  constructor(private gateKeeperService: GateKeeperService,
              private dialogRef: MatDialogRef<AddConstraintDialogComponent>,
              private alertService: AlertService,
              private dialog: MatDialog,
              private breakpointObserver: BreakpointObserver,
              @Inject(MAT_DIALOG_DATA) public data) {  }

  ngOnInit(): void {
    this.clusterId = this.data.clusterId;
    this.gateKeeperService.gateKeeperTemplateDirList(this.clusterId)
      .pipe(take(1)).subscribe({
      next: (dirs) => {
        this.dirStructure = dirs;
        this.topDirs = Object.keys(dirs);
      }
    });
    this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.XSmall])
      .pipe(
        map(result => result.matches),
        takeUntil(this.unsubscribe$)
      ).subscribe({
      next: (newIsHandsetOrXS) => {
        this.isHandsetOrXS = newIsHandsetOrXS;
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  toggleSidenav() {
    this.sidenavExpanded = !this.sidenavExpanded;
  }

  loadTemplate(dir: string, subDir: string, $event) {
    if ($event.checked) {
      this.gateKeeperService.loadGateKeeperTemplate(this.clusterId, dir, subDir)
        .pipe(take(1))
        .subscribe({
          next: template => {
            this.currentlySelectedTemplates.push({selectedTemplate: template, selectedTemplateName: subDir, selectedTopDir: dir, displayTemplateContent: true});
          }
        });
    } else {
      this.currentlySelectedTemplates = this.currentlySelectedTemplates.filter(t => t.selectedTemplateName !== subDir);
    }
  }

  deployMultipleGateKeeperTemplates() {
    const templates = this.currentlySelectedTemplates.map(t => `${t.selectedTopDir}/${t.selectedTemplateName}`);
    this.gateKeeperService.deployMultipleGateKeeperTemplates(this.clusterId, templates)
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (response.data.statusCode === 200) {
            this.alertService.success(response.data.message);
          }
          else {
            this.alertService.danger(response.data.message);
          }
        }
      });
    this.dialogRef.close({reloadData: true});
  }


  onNoClick() {
    this.dialogRef.close({cancel: true});
  }

  openK8sManifest(template: IGSelectedTemplate) {
    const openAddConstraint = this.dialog.open(AddCustomConstraintTemplateComponent, {
      width: '1000px',
      height: 'auto',
      closeOnNavigation: true,
      disableClose: false,
      data: {clusterId: this.clusterId, dir: template.selectedTopDir, subDir: template.selectedTemplateName}
    });
    openAddConstraint.afterClosed()
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (response && response.closeParentDialog) {
            setTimeout(() => {
              this.dialogRef.close({reload: true});
            }, 1000);
          }
        }
      });
  }

  unselectTemplate(template: IGSelectedTemplate, $event: MatCheckboxChange) {
    this.checkboxes.forEach((checkboxElement: any) => {
      if (checkboxElement.id === template.selectedTemplateName){
        checkboxElement.checked = false;
        this.currentlySelectedTemplates = this.currentlySelectedTemplates.filter(t => t.selectedTemplateName !== template.selectedTemplateName);
      }
    });
  }
}
