import {AfterViewInit, Component, OnInit, ViewChild, OnDestroy} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AlertService} from '@full-fledged/alerts';
import {ImageService} from '../../../../../core/services/image.service';
import {ImageScanResultIssueService} from '../../../../../core/services/image-scan-result-issue.service';
import {IServerResponse} from '../../../../../core/entities/IServerResponse';
import {IImage, IImageScanData} from '../../../../../core/entities/IImage';
import {IImageScanResultIssue} from '../../../../../core/entities/IImageScanResultIssue';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {FormControl} from '@angular/forms';
import {combineLatest, merge, Observable, of, Subject} from 'rxjs';
import {Title} from '@angular/platform-browser';
import {MatSelectChange} from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { ImageIssueMoreDataDialogComponent } from '../image-issue-more-data-dialog/image-issue-more-data-dialog.component';
import { switchMap, take, takeUntil } from 'rxjs/operators';
import {NgxUiLoaderService} from 'ngx-ui-loader';
import {CsvService} from '../../../../../core/services/csv.service';


@Component({
  selector: 'app-image-scan-result',
  templateUrl: './image-scan-result.component.html',
  styleUrls: ['./image-scan-result.component.scss']
})
export class ImageScanResultComponent implements OnInit, AfterViewInit, OnDestroy {
  subMenuTitle = '';
  displayedColumns: string[] = [
    'policy',
    'compliant',
    'required',
    'critical_issues',
    'major_issues',
    'medium_issues',
    'low_issues',
    'negligible_issues'];
  issuesDisplayedColumns: string[] = [
    'scanner',
    'isCompliant',
    'severity',
    'type',
    'packageName',
    'name',
    'installedVersion',
    'isFixable',
    'more'
  ];
  imageId: number;
  limit = this.getLimitFromLocalStorage() ? Number(this.getLimitFromLocalStorage()) : 10;
  page = 0;
  totalCount = 0;
  imageScanResultLimit = this.getLimitFromLocalStorage() ? Number(this.getLimitFromLocalStorage()) : 10;
  imageScanResultPage = 0;
  pageBrowserTitle: string;
  totalImageScanResultData: number;
  dataSource: IImage;
  scannerComplianceReport: MatTableDataSource<IImageScanData>;
  imageScanResultIssueData: MatTableDataSource<IImageScanResultIssue>;
  clusterId: number;
  policyIds: string[];
  /** Initialized when filtering vulnerabilities by a specific policy ID, otherwise passed
   * as undefined to get all vulnerabilities */
  policyIdFilter: number;
  scanButtonText: string;
  displayComplianceAndIssueTable = true;
  imageScanDates: Array<{created_at: number}>;
  currentlySelectedDate: number;
  scanDateDefault: FormControl;
  imageNamespaces: string[];
  @ViewChild('complianceSort') sort: MatSort;
  @ViewChild('issueSort') issueSort: MatSort;

  @ViewChild('compliancePaginator') compliancePaginator: MatPaginator;
  @ViewChild('issuePaginator') issuePaginator: MatPaginator;

  isAllIssues: boolean;
  scanResultsIssuesId: number;
  scanResultText: string;
  scanResultTextColor: string;
  displayImageScanSpinner$: Observable<boolean>;

  lastScanReport: IImageScanData;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private titleService: Title,
    private route: ActivatedRoute,
    private alertService: AlertService,
    private imageService: ImageService,
    private imageScanResultIssueService: ImageScanResultIssueService,
    public dialog: MatDialog,
    protected loader: NgxUiLoaderService,
    protected csvService: CsvService,
    private router: Router) {
    this.imageId = +this.route.snapshot.paramMap.get('imageId');
  }

  ngOnInit(): void {
    this.route.parent.parent.params.subscribe(param => this.clusterId = param.id);
    this.isAllIssues = true;
    this.getImageByImageId();
    // this.setImageScanQueueStatus();
    this.getCountOfImageScanData();
  }

  ngAfterViewInit() {
    merge(this.route.queryParams, this.sort.sortChange, this.issueSort.sortChange)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => this.getImageScanDataByImageId(true));
    // merge(this.route.queryParams, this.issueSort.sortChange).subscribe(() => this.getImageScanResultsIssues());
  }

  getCountOfImageScanData() {
    this.imageService.getCountOfImageScanData(this.imageId)
      .pipe(take(1))
      .subscribe((result) => {
        const hasBeenScanned = +result.data !== 0;
        this.scanButtonText = hasBeenScanned ? 'Rescan Image' : 'Scan Image';
        this.displayComplianceAndIssueTable = hasBeenScanned;
      }, () => {
        this.scanButtonText = 'Scan Image';
      });
  }

  getImageByImageId() {
    this.imageService.getImageByImageId(this.clusterId, this.imageId)
      .pipe(
        switchMap((response: IServerResponse<IImage>) => {
          this.dataSource = response.data;
          this.scanResultText = this.dataSource.scanResults ? this.dataSource.scanResults : 'Unscanned';
          this.scanResultTextColor = ['unscanned', 'non-compliant'].includes(this.scanResultText.toLowerCase()) ? 'red' : 'green';
          this.pageBrowserTitle = this.dataSource.name + ':' + this.dataSource.tag;
          this.titleService.setTitle(this.pageBrowserTitle);
          if (response.data.scanQueued) {
            this.setImageScanQueueStatus();
          } else {
            this.displayImageScanSpinner$ = of(false);
          }
          return this.imageService.getNamespaceByImageHash(this.dataSource.dockerImageId);
        }),
        take(1),
      )
      .subscribe((namespaces) => {
          this.imageNamespaces = namespaces.data.map(namespace => namespace.namespace);
    }, error => {
      this.alertService.danger(error.error.message);
      // this.router.navigate(['/private']);
    });
  }

  getImageScanDataByImageId(reloadScanDateSelection = false) {
    this.imageService.getImageScanDates(this.imageId)
      .pipe(
        switchMap((result) => {
          this.imageScanDates = result.data;
          if (this.imageScanDates.length) {
            if (reloadScanDateSelection) {
              this.currentlySelectedDate = this.imageScanDates[0].created_at;
            }
            this.scanDateDefault = new FormControl(this.currentlySelectedDate);
            return this.imageService.getImageScanDataByImageId(this.imageId, this.currentlySelectedDate, this.limit, this.page, this.sort);
          } else {
            // We didn't have any scans for this image, so don't make the other API calls
            return of(null);
          }
        }),
        switchMap((result: IServerResponse<{ totalCount: number, list: IImageScanData[] }>) => {
          if (result?.data?.list[0]) {
            // Get the ID from image_scan_results to query against the image_scan_results_issues table
            this.scanResultsIssuesId = result.data.list[0].id;
            // Use combineLatest to make sure we have data from both API calls before doing anything with them.
            // This is important because handling the response from getImageScanResultsIssues relies on having handled the other response first.
            return combineLatest([
              of(result),
              this.getIssues()
            ]);
          } else {
            return of([null, null]);
          }
        }),
        take(1),
      )
      .subscribe((result: [IServerResponse<{totalCount: number, list: IImageScanData[]}>,
          IServerResponse<{totalCount: number, list: IImageScanResultIssue[]}>]) => {
        // Handle the response from getImageScanDataByImageId
        if (result[0]?.data?.list) {
          this.handleImageScanData(result[0]);
        }
        // Handle the response from getImageScanResultsIssues
        if (result[1]?.data) {
          this.handleImageScanResultsIssues(result[1]);
        }
      },
      (error => {
        this.alertService.danger(error.error.message);
      }));
  }

  getIssues(): Observable<IServerResponse<{totalCount: number, list: IImageScanResultIssue[]}>> {
    return this.imageScanResultIssueService.getImageScanResultsIssues(this.scanResultsIssuesId,
      this.currentlySelectedDate,
      false,
      this.imageScanResultPage,
      this.imageScanResultLimit,
      this.issueSort,
      this.policyIdFilter);
  }

  handleImageScanData(response: IServerResponse<{totalCount: number, list: IImageScanData[]}>) {
    this.scannerComplianceReport = new MatTableDataSource(response.data.list);
    this.totalCount = response.data.totalCount;
    this.scannerComplianceReport.sort = this.sort;
    this.policyIds = response.data.list.map(scan => String(scan.policyId));
    this.lastScanReport = response.data.list?.pop();
    if (this.lastScanReport) {
      this.lastScanReport.summary = this.lastScanReport.summary?.replace(/\n/g, '<br/>');
    }
  }

  scannerPageEvent(pageEvent: PageEvent) {
    this.limit = pageEvent.pageSize;
    this.page = pageEvent.pageIndex;
    this.setLimitToLocalStorage(this.limit);
    this.getImageScanDataByImageId();
  }

  pageIssues(pageEvent: PageEvent) {
    this.imageScanResultLimit = pageEvent.pageSize;
    this.imageScanResultPage = pageEvent.pageIndex;
    this.getIssues()
      .pipe(take(1))
      .subscribe((data) => this.handleImageScanResultsIssues(data));
  }

  scanImage() {
    const filterImageIds = {
      imageIds: [this.imageId]
    };
    this.imageService.scanImageModule(this.clusterId, filterImageIds).subscribe(response => {
      if (response.success) {
        this.alertService.success('Image Scan Queued');
        this.setImageScanQueueStatus();
      }
    }, error => {
      this.alertService.danger(error.error.message);
    });
  }

  handleImageScanResultsIssues(response: IServerResponse<{totalCount: number, list: IImageScanResultIssue[]}>) {
    const modifiedData = response.data.list ? response.data.list.map(d => {
      d.packageName = d.packageName ?? d.extraData.PkgName;
      d.installedVersion = d.installedVersion ?? d.extraData.InstalledVersion;
      d.fixedVersion = d.fixedVersion ?? d.extraData.FixedVersion;
      return d;
    }) : [];
    this.imageScanResultIssueData = new MatTableDataSource(modifiedData);
    this.totalImageScanResultData = response.data.totalCount;
    this.sortIssueTitles();
  }

  /** Filter vulnerabilities to get only issues obtained using the selected security policy */
  getIssuesByPolicy(row: IImageScanData){
    this.imageScanResultPage  = 0;
    this.imageScanResultLimit = 20;
    this.scanResultsIssuesId = row.id;
    this.policyIdFilter = row.policyId;
    this.pageIssues({length: this.totalImageScanResultData, pageSize: 20, pageIndex: 0});
    this.issuePaginator.firstPage();
    this.policyIds = [String(row.policyId)];
  }

  onChangeScanDate(event: MatSelectChange) {
    this.currentlySelectedDate = event.value;
    this.getImageScanDataByImageId();
  }

  setImageScanQueueStatus(){
    this.displayImageScanSpinner$ = this.imageService.getImageScanQueueStatus(this.imageId);
    const dataSubscription = this.displayImageScanSpinner$.subscribe(data => {
      if (!data) {
        dataSubscription.unsubscribe();
        this.getImageByImageId();
        this.getCountOfImageScanData();
        this.getImageScanDataByImageId(true);
      }
    });
  }

  setLimitToLocalStorage(limit: number) {
    localStorage.setItem('image_scan_result_table_limit', String(limit));
  }
  getLimitFromLocalStorage(): string | null {
    return localStorage.getItem('image_scan_result_table_limit');
  }

  showMoreIssueDetails(issue: IImageScanResultIssue) {
    this.dialog.open(ImageIssueMoreDataDialogComponent, {
      width: '70vw',
      data: {issue}
    });
  }

  sortIssueTitles() {
    this.imageScanResultIssueData.sortingDataAccessor = (data: any, sortHeaderId: string): string => {
      if (sortHeaderId === 'name') {
        return data[sortHeaderId].toLocaleLowerCase();
      }
      return data[sortHeaderId];
    };
  }

  searchCVE(cve: string) {
    this.router.navigate(['/private/clusters', this.clusterId, 'images'],
      {state: {cve, onlyRunning: this.dataSource.runningInCluster, imageName: this.dataSource.name}});
  }

  downloadCsv() {
    this.loader.startLoader('scan-issue-csv-download');
    this.imageScanResultIssueService.getImageScanResultsIssuesCsv(
      this.imageId,
      this.scanResultsIssuesId,
      this.currentlySelectedDate,
      false,
      this.issueSort,
      this.policyIdFilter)
      .pipe(take(1))
      .subscribe({
        next: csvDto => {
          this.csvService.downloadCsvFile(csvDto.data?.csv, csvDto.data?.filename);
        },
        error: () => {
          this.alertService.danger('Error downloading report');
          this.loader.stopLoader('scan-issue-csv-download');
        },
        complete: () => this.loader.stopLoader('scan-issue-csv-download')
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
