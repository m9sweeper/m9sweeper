import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DatePipe, Location} from '@angular/common';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {MatLegacyDialog as MatDialog} from '@angular/material/legacy-dialog';
import {AlertService} from '@full-fledged/alerts';
import {JwtAuthService} from '../../../../../core/services/jwt-auth.service';
import {CustomValidators} from '../../../form-validator/custom-validators';
import {ExceptionsService} from '../../../../../core/services/exceptions.service';
import {ScannerService} from '../../../../../core/services/scanner.service';
import {IScanner} from '../../../../../core/entities/IScanner';
import {ICluster} from '../../../../../core/entities/ICluster';
import {ClusterService} from '../../../../../core/services/cluster.service';
import {PolicyService} from '../../../../../core/services/policy.service';
import {IPolicy} from '../../../../../core/entities/IPolicy';
import {NamespaceService} from '../../../../../core/services/namespace.service';
import {INamespace} from '../../../../../core/entities/INamespace';
import {IException} from '../../../../../core/entities/IException';
import {forkJoin, Observable, of} from 'rxjs';
import {IGateKeeperConstraintDetails} from '../../../../../core/entities/IGateKeeperConstraint';
import {GateKeeperService} from '../../../../../core/services/gate-keeper.service';
import {VulnerabilitySeverity} from '../../../../../core/enum/VulnerabilitySeverity';

@Component({
  selector: 'exception-create',
  templateUrl: './exception-create.component.html',
  styleUrls: ['./exception-create.component.scss']
})
export class ExceptionCreateComponent implements OnInit, AfterViewInit {
  exceptionForm: UntypedFormGroup;
  subMenuTitle: string;
  editMode: boolean;
  exceptionId: number;

  origException: IException;
  scanners: IScanner[];
  policies: IPolicy[];
  clusters: ICluster[];
  namespaces: INamespace[];
  namespacesToBeDisplayed: INamespace[];

  scannersLoaded = false;
  policiesLoaded = false;
  clustersLoaded = false;
  namespacesLoaded = false;

  origSelectedPolicies: string[];
  origSelectedClusters: string[];
  origSelectedNamespaces: string[];

  gatekeeperConstraintList: Observable<IGateKeeperConstraintDetails[]>;
  filteredGatekeeperConstraints: Observable<IGateKeeperConstraintDetails[]>;

  @ViewChild('issueIdentifierLabel') issueIdentifierLabel;
  loading = false;
  submitButtonText = 'Submit';

  severityLevels = [ VulnerabilitySeverity.NEGLIGIBLE,
                    VulnerabilitySeverity.LOW,
                    VulnerabilitySeverity.MEDIUM,
                    VulnerabilitySeverity.MAJOR,
                    VulnerabilitySeverity.CRITICAL];

  constructor(
    private exceptionsService: ExceptionsService,
    private formBuilder: UntypedFormBuilder,
    private alertService: AlertService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private jwtAuthService: JwtAuthService,
    private location: Location,
    private scannerService: ScannerService,
    private policyService: PolicyService,
    private clusterService: ClusterService,
    private namespaceService: NamespaceService,
    private datePipe: DatePipe,
    private gateKeeperService: GateKeeperService) {

    const getCurrentUrl = this.router.url;
    this.editMode = getCurrentUrl.split('/').reverse()[0] === 'edit';
    if (this.editMode){
      this.submitButtonText = 'Update';
    }

    this.exceptionForm = this.formBuilder.group({
      title: ['', [CustomValidators.requiredNoTrim, Validators.maxLength(255)]],
      reason: ['', []],
      issueIdentifier: ['', [Validators.maxLength(255), Validators.required]],
      startDate: [new Date(),
        {
          validators: [Validators.required, CustomValidators.checkForCurrentDate()],
          updateOn: 'blur'
        }],
      endDate: ['', {
        validators: [],
      }],
      status: ['', [Validators.required]],
      scannerId: [''],
      policies: ['', Validators.nullValidator],
      clusters: [''],
      namespaces: [''],
      type: [''],
      imageMatch: ['%', Validators.nullValidator],
      altSeverity: ['', [Validators.required]]
    },
      {
      validators: [CustomValidators.checkEndDateIsGreaterThanStartDate()],
      updateOn: 'blur'
    }
    );
    if (this.editMode) {
      this.exceptionForm.controls.startDate.setValidators(null);
      this.subMenuTitle = 'Edit Exception';
    } else {
      this.exceptionForm.controls.policies.disable();
      this.subMenuTitle = 'Create Exception';
    }
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.exceptionId = params.id;
      if (!this.exceptionId && this.editMode) {
        this.editMode = false;
        this.subMenuTitle = 'Create Exception';
        this.alertService.danger('Exception Could not be retrieved. Please try again later.');
      }
    });

    this.scannerService.getAllScanners().subscribe(val => {this.scanners = val.data; this.scannersLoaded = true; });
    this.policyService.getAllPolicies().subscribe(val => {
      this.policies = val.data.list;
      this.policiesLoaded = true;
    });
    this.clusterService.getAllClusters().subscribe(val => {
      this.clusters = val.data;
      this.clustersLoaded = true;
    });
    this.namespaceService.getCurrentK8sNamespaces().subscribe(val => {
      this.namespaces = val.data;
      this.namespacesToBeDisplayed = val.data;
      this.namespacesLoaded = true;
    });

    if (this.editMode) {
      this.exceptionsService.getExceptionById(this.exceptionId).subscribe(
        response => {
          this.origException = response.data[0];
          this.populateData();
          this.disableAllExceptionTypeFields();
        },
        _ => {
          this.alertService.danger('Exception could not be retrieved. Please try again later');
          this.exceptionId = null;
        }
      );
    }
    this.issueIdentifier.valueChanges.subscribe(changedValue => {
      this._filter(changedValue);
    });
  }

  ngAfterViewInit(){
    this.route.queryParams.subscribe(params => {
      const namespaceSet = new Set(params.namespaces);
      const namespaces = Array.from(namespaceSet);
      const namespacesMappedWithClusterId = namespaces.map(n => `${n}:${params.clusterId}`);
      if (Object.keys(params).length > 0) {
        this.issueIdentifier.setValue(params.cve);
        this.exceptionForm.controls.type.setValue('policy');
        this.exceptionForm.controls.policies.enable();
        this.exceptionForm.controls.clusters.setValue([params.clusterId]);
        this.loadNamespacesForSelectedClusters([params.clusterId], true);
        this.exceptionForm.controls.scannerId.setValue(params.scannerId);
        this.exceptionForm.controls.policies.setValue(params.policyIds);
        this.exceptionForm.controls.namespaces.setValue(namespacesMappedWithClusterId);
        this.exceptionForm.controls.status.setValue('review');
        this.exceptionForm.controls.imageMatch.setValue(`%${params.imageName}%`);
        this.exceptionForm.controls.title.setValue(`Requesting Exception for ${params.cve} in ${params.imageName} of ${namespaces.join(',')}`);
      }
    });
  }

  populateData() {
    this.exceptionForm.controls.title.reset(this.origException.title);
    this.issueIdentifier.reset(this.origException.issueIdentifier);
    this.exceptionForm.controls.reason.reset(this.origException.reason);
    this.exceptionForm.controls.status.reset(this.origException.status);
    /*
      https://stackoverflow.com/questions/35651517/angular-ui-datepicker-is-getting-wrong-date
    */
    const modifiedDate = new Date(this.origException.startDate);
    this.exceptionForm.controls.startDate.reset(new Date(modifiedDate.getTime() + modifiedDate.getTimezoneOffset() * 60000));
    this.exceptionForm.controls.startDate.setValidators(CustomValidators.checkForCurrentDate(true, this.origException.startDate));
    this.exceptionForm.controls.endDate.reset(this.origException.endDate);
    this.exceptionForm.controls.type.setValue(this.origException.type);
    this.exceptionForm.controls.imageMatch.setValue(this.origException.imageMatch);

    this.origSelectedPolicies = this.origException.policies.map(p => p.id.toString());
    this.exceptionForm.controls.policies.setValue(this.origSelectedPolicies);

    this.origSelectedClusters = this.origException.clusters.map(c => c.id.toString());
    this.exceptionForm.controls.clusters.setValue(this.origSelectedClusters);
    this.loadNamespacesForSelectedClusters(this.origSelectedClusters);

    this.origSelectedNamespaces = this.origException.namespaces.map(n => n.name);
    this.exceptionForm.controls.namespaces.setValue(this.setNamespacesForSelectedClusters(this.origSelectedNamespaces));

    if (this.origException.type === 'gatekeeper') {
      if (this.origException.clusters.length > 0) {
        this.loadGatekeeperConstraints(this.origException.clusters.map(cluster => String(cluster.id)));
      }
    }
    this.exceptionForm.controls.altSeverity.setValue(this.origException.altSeverity);
  }

  onSubmit() {
    this.enableSpinner();
    const data = this.exceptionForm.getRawValue();
    data.startDate = this.datePipe.transform(data.startDate, 'yyyy-MM-dd');
    if (data.endDate) {
      data.endDate = this.datePipe.transform(data.endDate, 'yyyy-MM-dd');
    }
    if (data.namespaces.length) {
      data.namespaces = data.namespaces.map(n => n.split(':')[0]);
      data.namespaces = new Set(data.namespaces);
      data.namespaces = Array.from(data.namespaces);
    }
    data.imageMatch = data.imageMatch === '' ? '%' : data.imageMatch ;
    if (this.editMode) {
      data.isTempException = this.origException.isTempException;
      this.submitButtonText = 'Updating...';
      this.exceptionsService.updateExceptionById(data, this.exceptionId).subscribe(
        response => {
          this.disableSpinner();
          this.router.navigate(['private', 'exceptions', response.data.id]);
          this.alertService.success('Exception updated');
        },
        err => this.handleApiError(err)
      );
    } else {
      this.submitButtonText = 'Submitting...';
      this.exceptionsService.createException(data).subscribe(
        response => {
          this.router.navigate(['private', 'exceptions', response.data.id]);
          this.alertService.success('Exception created');
        },
        err => this.handleApiError(err)
      );
    }
  }

  handleApiError(err) {
    let msg = 'Something went wrong, please try again later.';
    if (err.status && err.status === 400) { msg = err.error?.message || msg; }
    this.disableSpinner();
    if (this.editMode) {
      this.submitButtonText = 'Update';
    } else {
      this.submitButtonText = 'Submit';
    }
    this.alertService.danger(msg);
  }

  cancel() {
    this.location.back();
  }

  get startDate(){
    return this.exceptionForm.controls.startDate;
  }

  displayExceptionFields(event) {
    this.exceptionForm.controls.policies.disable();
    switch (event.value){
      case 'policy':
        this.exceptionForm.controls.policies.enable();
        this.changeCVELabel('Issue (CVE Code)');
        // this.issueIdentifier.setErrors({gatekeeperAndClusterSelected: false });
        this.issueIdentifier.markAsUntouched();
        this.gatekeeperConstraintList = of([]);
        break;
      case 'gatekeeper':
        this.exceptionForm.controls.policies.disable();
        this.changeCVELabel('Issue (Constraint Template Name)');
        const getSelectedClusters = this.exceptionForm.controls.clusters.value;
        if (getSelectedClusters instanceof Array && getSelectedClusters.length > 0) {
          this.loadGatekeeperConstraints(getSelectedClusters);
        }
        break;
      case 'override':
        this.exceptionForm.controls.policies.enable();
        this.changeCVELabel('Issue (CVE Type Code)');
        this.issueIdentifier.markAsUntouched();
        this.gatekeeperConstraintList = of([]);
        break;
    }
  }

  disableAllExceptionTypeFields(){
    const getExceptionType = this.origException.type;
    if (getExceptionType === 'gatekeeper') {
      this.exceptionForm.controls.policies.disable();
    }
  }

  changeCVELabel(labelText: string){
    this.issueIdentifierLabel.nativeElement.innerText = labelText;
  }

  get issueIdentifier(){
    return this.exceptionForm.controls.issueIdentifier;
  }

  onClusterChange($event){
    console.log('cluster changed ......', $event.value);
    this.loadNamespacesForSelectedClusters($event.value);
    if (this.exceptionForm.controls.type.value === 'policy') {
      this.gatekeeperConstraintList = of([]);
    }
    else {
      this.loadGatekeeperConstraints($event.value);
    }
  }

  private loadGatekeeperConstraints(clusters: string[]) {
     const constraints$: Observable<any> = forkJoin(
        clusters.map(clusterId => this.gateKeeperService.getGateKeeperConstraintTemplatesByCluster(+clusterId))
      );
     constraints$.subscribe(data => {
        const filteredData = data.filter(d => d.length > 0);
        const flattenData = filteredData.flat();
        const constraints: IGateKeeperConstraintDetails[] = flattenData;
        this.gatekeeperConstraintList = of(constraints);
        this.filteredGatekeeperConstraints = this.gatekeeperConstraintList;
      });
    }

  private _filter(params: string) {
    this.gatekeeperConstraintList.subscribe(data => {
      const filteredData = data.filter(d => d.metadata.name.toLowerCase().match(params.toLowerCase()) !== null);
      this.filteredGatekeeperConstraints = of(filteredData);
    });
  }

  private enableSpinner() {
    this.loading = true;
  }

  private disableSpinner() {
    this.loading = false;
  }

  private loadNamespacesForSelectedClusters(selectedClusters: string[], requestException = false) {
    if (requestException) {
      this.namespaceService.getCurrentK8sNamespaces().subscribe(val => {
        this.namespaces = val.data;
        this.namespacesLoaded = true;
        const selectedClustersToNumber = selectedClusters.map(v => Number(v));
        this.namespacesToBeDisplayed = this.namespaces.filter(n => selectedClustersToNumber.includes(n.clusterId));
      });

    } else {
      if (selectedClusters.length) {
        const selectedClustersToNumber = selectedClusters.map(v => Number(v));
        this.namespacesToBeDisplayed = this.namespaces.filter(n => selectedClustersToNumber.includes(n.clusterId));
        if (this.exceptionForm.value.namespaces.length) {
          const getSelectedNamespaces = this.exceptionForm.value.namespaces;
          const namespacesToBeDisplayedNames = this.namespacesToBeDisplayed.map(n => `${n.name}:${n.clusterId}`);
          const getFilteredNamespaces = getSelectedNamespaces.filter(n => namespacesToBeDisplayedNames.includes(n));
          this.exceptionForm.controls.namespaces.setValue(getFilteredNamespaces);
        }
      } else {
        this.namespacesToBeDisplayed = this.namespaces;
      }

    }
  }

  private setNamespacesForSelectedClusters(namespaces: string[]){
    const modifiedNamespaces = [];
    if (namespaces.length) {
      for (const n of this.namespacesToBeDisplayed) {
        if (namespaces.includes(n.name)){
          modifiedNamespaces.push(`${n.name}:${n.clusterId}`);
        }
      }
    }
    return modifiedNamespaces;
  }

  formatNamespaceDisplay() {
    let namespaces = this.exceptionForm.value.namespaces;
    if (namespaces.length) {
      namespaces = namespaces.map(n => n.split(':')[0]);
      // console.log(namespaces);
      return namespaces.join(', ');
    }
  }
}
