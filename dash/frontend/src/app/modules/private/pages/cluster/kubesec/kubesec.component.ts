import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatLegacyDialog as MatDialog} from '@angular/material/legacy-dialog';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {KubesecService} from '../../../../../core/services/kubesec.service';
import {Subject} from 'rxjs';
import {AlertService} from '@full-fledged/alerts';
import {PodService} from '../../../../../core/services/pod.service';
import {NamespaceService} from '../../../../../core/services/namespace.service';
import {take, takeUntil} from 'rxjs/operators';
import {NgxUiLoaderService} from 'ngx-ui-loader';
import {ActivatedRoute} from '@angular/router';
import {KubesecDialogComponent} from './kubesec-dialog/kubesec-dialog.component';
import {MatLegacyOption as MatOption} from '@angular/material/legacy-core';
import {MatLegacyTableDataSource as MatTableDataSource} from '@angular/material/legacy-table';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-kubesec',
  templateUrl: './kubesec.component.html',
  styleUrls: ['./kubesec.component.scss']
})
export class KubesecComponent implements OnInit, OnDestroy {

  private unsubscribe$ = new Subject<void>();

  podSelectionOpt: number;
  selectedPodNames = [];
  selectedPods: any[];
  currentPods = [];
  selectedNamespaces: string[];
  clusterId: number;
  currentNamespaces: any[];
  podFile: File;

  kubesecReport: any;
  isCompleted = true;
  displayedColumns: string[] = ['podNames', 'score'];

  namespaceForm: UntypedFormGroup;
  podForm: UntypedFormGroup;
  @ViewChild('podAll') set setThing(e: MatOption) {
    this.thing = e;
  }
  thing: MatOption;

  displayName: string;
  message: string;
  score: string;
  passed: [];
  advise: [];
  critical: [];
  criticalDisplayedColumns: string[] = ['criticalId', 'criticalPoints', 'criticalReason'];
  adviseDisplayColumns: string[] = ['adviseId', 'advisePoints', 'adviseReason'];
  passedDisplayColumns: string[] = ['passedId', 'passedPoints', 'passedReason'];
  passedDataSource: MatTableDataSource<any>;
  adviseDataSource: MatTableDataSource<any>;
  criticalDataSource: MatTableDataSource<any>;
  scoreColors = ['#ff0000', '#eeee00', '#ffa500', '#00ff00'];
  kubesecReportDownloadHref: string;

  constructor(
    private dialog: MatDialog,
    private formBuilder: UntypedFormBuilder,
    private alertService: AlertService,
    private podService: PodService,
    private namespaceService: NamespaceService,
    private kubesecService: KubesecService,
    private loaderService: NgxUiLoaderService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.namespaceForm = this.formBuilder.group({
      namespaceFormControl: new UntypedFormControl('')
    });
    this.podForm = this.formBuilder.group({
      podFormControl: new UntypedFormControl('')
    });

    this.namespaceForm.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe(data => this.getPodsFromSelectedNamespace());

    this.route.parent.params.pipe(take(1)).subscribe(param => {
      this.clusterId = param.id;
      this.getNamespaces();
    });
  }

  getNamespaces() {
    this.kubesecService.listNamespaces(this.clusterId).pipe(takeUntil(this.unsubscribe$)).subscribe(list => {
      if (list) {
        this.currentNamespaces = list.items;
      } else {
        this.alertService.danger('Could not get namespaces');
      }
    });
  }

  public onFileChange(event: any) {
    if (event.target.files.length > 0) {
      this.podFile = event.target.files[0];
    }
  }

  getPodsFromSelectedNamespace() {
    this.podFile = null;
    this.kubesecService.listPods(this.clusterId, this.namespaceForm.controls.namespaceFormControl.value)
      .pipe(takeUntil(this.unsubscribe$)).subscribe(list => {
      if (list) {
        list = list.filter(data => data !== null);
        this.currentPods = [];
        for (const pod of list) {
          if (pod && pod.items.length > 0) {
            for (const item of pod.items) {
              this.currentPods.push(item);
            }
          }
        }
      } else {
        this.alertService.danger('Could not get pods in ' + this.selectedNamespaces);
      }
    });
  }

  getKubesecReport() {
    this.loaderService.start();
    if (!this.podFile) {
      const info = [];
      for (const pod of this.podForm.controls.podFormControl.value) {
        if (pod.name && pod.namespace) {
          info.push({
            name: pod.name,
            namespace: pod.namespace,
          });
        }
        this.selectedPodNames.push(pod.name);
      }
      this.kubesecService.getKubesecReport(info, this.clusterId)
        .pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
        this.kubesecReport = res;
        if (this.kubesecReport.length === 1) {
          this.populateTable();
        }
        this.loaderService.stop();
      }, (err) => {
        this.loaderService.stop();
        this.alertService.danger(err.error.text ? err.error.text : 'Could not get your kubesec report');
      });
    } else if (!this.podForm.controls.podFormControl.value) {
      const formData = new FormData();
      formData.append('podFile', this.podFile, 'podFile');
      this.kubesecService.getPodFileKubesecReport(formData).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
        this.kubesecReport = [res];
        this.populateTable();
        this.loaderService.stop();
      }, (err) => {
        this.loaderService.stop();
        this.alertService.danger(err.error.text ? err.error.text : 'Could not get your kubesec report');
      });
    }
  }

  populateTable() {
    this.displayName = 'KubeSec ' + this.kubesecReport[0].object.substring(4);
    this.message = this.kubesecReport[0].message;
    this.score = this.kubesecReport[0].score;
    this.kubesecReport[0].scoring.passed ? this.passed = this.kubesecReport[0].scoring.passed : this.passed = [];
    this.kubesecReport[0].scoring.advise ? this.advise = this.kubesecReport[0].scoring.advise : this.advise = [];
    this.kubesecReport[0].scoring.critical ? this.critical = this.kubesecReport[0].scoring.critical : this.critical = [];
    this.passedDataSource = new MatTableDataSource(this.passed);
    this.adviseDataSource = new MatTableDataSource(this.advise);
    this.criticalDataSource = new MatTableDataSource(this.critical);
    this.kubesecReportDownloadHref = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.kubesecReport[0]));
  }

  decideScoreColor(score: string): string {
    const scoreNum = +score;
    if (scoreNum <= 0) {
      return this.scoreColors[0];
    } else if (0 < scoreNum && scoreNum <= 3) {
      return this.scoreColors[1];
    } else if (3 < scoreNum && scoreNum <= 6) {
      return this.scoreColors[2];
    } else {
      return this.scoreColors[3];
    }
  }

  sanitize(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  clickEvent(id: any) {
    this.dialog.open(KubesecDialogComponent, {
      width: '1000px',
      height: '80%',
      closeOnNavigation: true,
      disableClose: false,
      data: this.kubesecReport[id],
    });
  }

  toggleAllSelection(matOption: MatOption, namespace: boolean) {
    // if the select all option is selected for namespaces
    if (matOption.selected && namespace) {
      this.namespaceForm.controls.namespaceFormControl
        .patchValue([...this.currentNamespaces.map(item => item.metadata.name), 'selectAll']);
    }
    // if the select all option is not selected for namespaces
    else if (!matOption.selected && namespace) {
      this.namespaceForm.controls.namespaceFormControl.patchValue([]);
      this.podForm.controls.podFormControl.patchValue([]);
    }
    // if the select all option is selected for pods
    else if (matOption.selected && !namespace) {
      this.podForm.controls.podFormControl
        .patchValue([...this.currentPods.map(item => item.metadata), 'podAll']);
    }
    // if the select all option is not selected for pods
    else {
      this.podForm.controls.podFormControl.patchValue([]);
    }
  }

  togglePerOne(matOption: MatOption, namespace: boolean){
    // we use matOption for namespaces because it doesn't need a ViewChild
    if (namespace) {
      if (matOption.selected) {
        matOption.deselect();
        return false;
      }
      if (this.namespaceForm.controls.namespaceFormControl.value.length === this.currentNamespaces.length) {
        matOption.select();
      }
    }
    // unlike pods that need a ViewChild because of the *ngIf
    else {
      if (this.thing.selected) {
        this.thing.deselect();
        return false;
      }
      if (this.podForm.controls.podFormControl.value.length === this.currentPods.length) {
        this.thing.select();
      }
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
