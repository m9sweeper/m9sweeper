import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup
} from '@angular/forms';
import {KubesecService} from '../../../../../core/services/kubesec.service';
import {Subject} from 'rxjs';
import {AlertService} from 'src/app/core/services/alert.service';
import {PodService} from '../../../../../core/services/pod.service';
import {NamespaceService} from '../../../../../core/services/namespace.service';
import {take, takeUntil} from 'rxjs/operators';
import {NgxUiLoaderService} from 'ngx-ui-loader';
import {ActivatedRoute} from '@angular/router';
import {MatOption} from '@angular/material/core';
import {IKubesecReport} from '../../../../../core/entities/IKubesecReport';

@Component({
  selector: 'app-kubesec',
  templateUrl: './kubesec.component.html',
  styleUrls: ['./kubesec.component.scss']
})
export class KubesecComponent implements OnInit, OnDestroy {

  private unsubscribe$ = new Subject<void>();

  podSelectionOpt: number;
  selectedPodNames = [];
  currentPods = [];
  loadingPods = false;
  selectedNamespaces: string[];
  clusterId: number;
  currentNamespaces: any[];
  podFile: File;

  kubesecReports: IKubesecReport[] = [];
  isCompleted = true;
  displayedColumns: string[] = ['podNames', 'score'];

  namespaceForm: FormGroup;
  podForm: FormGroup;
  @ViewChild('podAll') set setThing(e: MatOption) {
    this.thing = e;
  }
  thing: MatOption;
  scoreColors = { red: '#ff0000', yellow: '#eeee00', orange: '#ffa500', green: '#00ff00'};


  constructor(
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private kubesecService: KubesecService,
    private loaderService: NgxUiLoaderService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.namespaceForm = this.formBuilder.group({
      namespaceFormControl: new FormControl('')
    });
    this.podForm = this.formBuilder.group({
      podFormControl: new FormControl('')
    });

    // this.namespaceForm.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
    //   console.log(data);
    //   // if
    //   if (!(data.namespaceFormControl.length === 1 && data.namespaceFormControl[0] === 'selectAll')) {
    //     this.getPodsFromSelectedNamespace();
    //   }
    // });

    this.route.parent.params.pipe(take(1)).subscribe(param => {
      this.clusterId = param.id;
      this.getNamespaces();
    });
  }

  getNamespaces() {
    this.kubesecService.listNamespaces(this.clusterId).pipe(takeUntil(this.unsubscribe$)).subscribe(list => {
      console.log('listNamespaces returned', list);
      if (list) {
        this.currentNamespaces = list.items;
      } else {
        this.alertService.danger('Could not get namespaces');
      }
    }, error => {
      console.log('listNamespaces returned an error', error);
      this.alertService.danger('Could not get namespaces');
    });
  }

  public onFileChange(event: any) {
    if (event.target.files.length > 0) {
      this.podFile = event.target.files[0];
    }
  }

  getPodsFromSelectedNamespace() {
    this.podFile = null;
    this.loadingPods = true;
    if (!this.namespaceForm.controls.namespaceFormControl.value || !this.namespaceForm.controls.namespaceFormControl.value.length) {
      this.currentPods = [];
      this.loadingPods = false;
      return;
    }
    // @TODO: implement debouncing (only set currentPods from the most recent API call)
    this.kubesecService.listPods(this.clusterId, this.namespaceForm.controls.namespaceFormControl.value).pipe(take(1)).subscribe(
      (list) => {
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
        this.loadingPods = false;
      },
      (error) => {
        console.log(error);
        this.alertService.danger('Could not get pods in ' + this.selectedNamespaces);
        this.loadingPods = false;
      }
    );
  }

  getKubesecReport() {
    this.loaderService.start();
    this.kubesecReports = [];
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
        .pipe(take(1))
        .subscribe(res => {
          this.kubesecReports = res;
          this.loaderService.stop();
        }, (err) => {
          this.loaderService.stop();
          this.alertService.danger(err.error.text ? err.error.text : 'Could not get your kubesec report');
        });
    } else if (!this.podForm.controls.podFormControl.value) {
      const formData = new FormData();
      formData.append('podFile', this.podFile, 'podFile');
      this.kubesecService.getPodFileKubesecReport(formData).pipe(take(1)).subscribe(res => {
        this.kubesecReports = [res];
        this.loaderService.stop();
      }, (err) => {
        this.loaderService.stop();
        this.alertService.danger(err.error.text ? err.error.text : 'Could not get your kubesec report');
      });
    }
  }

  // Color for passed/ advise/ critical sections
  decideScoreColor(score: string | number): string {
    const scoreNum = +score;
    if (scoreNum <= 0) {
      return this.scoreColors.red;
    } else if (0 < scoreNum && scoreNum <= 3) {
      return this.scoreColors.yellow;
    } else if (3 < scoreNum && scoreNum <= 6) {
      return this.scoreColors.orange;
    } else {
      return this.scoreColors.green;
    }
  }

  toggleAllSelection(matOption: MatOption, namespace: boolean) {
    // if the select all option is selected for namespaces
    if (matOption.selected && namespace) {
      this.namespaceForm.controls.namespaceFormControl
        .patchValue([...this.currentNamespaces.map(item => item.metadata.name), 'selectAll']);
      this.getPodsFromSelectedNamespace();
    }
    // if the select all option is not selected for namespaces
    else if (!matOption.selected && namespace) {
      this.namespaceForm.controls.namespaceFormControl.patchValue([]);
      this.podForm.controls.podFormControl.patchValue([]);
      this.getPodsFromSelectedNamespace();
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
        this.getPodsFromSelectedNamespace();
        return false;
      }
      if (this.namespaceForm.controls.namespaceFormControl.value.length === this.currentNamespaces.length) {
        matOption.select();
      }
      this.getPodsFromSelectedNamespace();
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
