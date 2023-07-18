import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Location} from '@angular/common';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {MatDialog} from '@angular/material/dialog';
import {ImageService} from '../../../../../core/services/image.service';
import {AlertService} from '@full-fledged/alerts';
import {IImage} from '../../../../../core/entities/IImage';
import {IServerResponse} from '../../../../../core/entities/IServerResponse';
import {CreateImageComponent} from '../create-image-form/create-image.component';
import {ActivatedRoute, Router} from '@angular/router';
import {fromEvent, merge, Observable, of, Subject} from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  startWith,
  switchMap,
  take, takeUntil
} from 'rxjs/operators';
import {AdvancedSearchDialogComponent} from './advanced-search-dialog/advanced-search-dialog.component';
import {ConfirmScanAllDialogComponent} from './confirm-scan-all-dialog/confirm-scan-all-dialog.component';
import {JwtAuthService} from '../../../../../core/services/jwt-auth.service';

@Component({
  selector: 'app-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss']
})

export class ImageComponent implements OnInit, AfterViewInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();

  displayedColumns: string[] = ['name', 'date', 'runningCluster', 'scanResult', 'Crt', 'Maj', 'Med', 'Min', 'Neg'];
  dataSource: MatTableDataSource<IImage>;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  clusterId: number;
  @ViewChild('imageInput') imageInput: ElementRef;
  searchTerm: string;
  limit = this.getLimitFromLocalStorage() ? Number(this.getLimitFromLocalStorage()) : 10;
  page = 0;
  totalCount = 0;
  cve: string;
  onlyRunning = false;
  userIsAdmin = false;
  imageName: string;

  constructor(
    private imageService: ImageService,
    private alertService: AlertService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private jwtAuthService: JwtAuthService,
    private location: Location,
  ) {
    // .getCurrentNavigation() may return null due to a bug in Angular 15
    // https://stackoverflow.com/questions/54891110/router-getcurrentnavigation-always-returns-null
    // const currentNavigation = this.router.getCurrentNavigation();
    const currentState: any = this.location.getState();
    this.cve = currentState?.cve;
    this.onlyRunning = currentState?.onlyRunning !== 'NO';
    this.imageName = currentState?.imageName;
  }

  ngOnInit(): void {
    this.searchTerm = '';
    this.userIsAdmin = this.jwtAuthService.isAdmin();
    this.route.parent.parent.params
      .pipe(take(1))
      .subscribe(param => this.clusterId = param.id);
  }

  ngAfterViewInit() {
    const search$ = fromEvent<any>(this.imageInput.nativeElement, 'keyup')
      .pipe(
        map(event => event.target.value),
        startWith(''),
        debounceTime(500),
        distinctUntilChanged()
      );
    search$.pipe(
      switchMap(() => {
        return merge(this.route.queryParams, this.sort.sortChange);
      }),
      switchMap(() => {
        return this.imageName && this.cve && this.onlyRunning !== undefined
          ? this.searchImages(this.imageName, this.cve, this.onlyRunning)
          : this.searchImages();
      }),
      takeUntil(this.unsubscribe$)
    ).subscribe(resp => this.onSearchSuccess(resp), () => {});
  }

  searchImages(name = '', cve= '', onlyRunning = false): Observable<IServerResponse<{totalCount: number, list: IImage[]}>> {
    return this.imageService.searchImageUnderClusterId(this.clusterId, this.imageInput.nativeElement.value || name, cve,
      onlyRunning, this.page, this.limit, this.sort);
  }

  onSearchSuccess(response: IServerResponse<{totalCount: number, list: IImage[]}>): void {
    if (!response?.success) {
      return;
    }
    this.dataSource = new MatTableDataSource(response.data.list);
    this.totalCount = response.data.totalCount;
  }

  pageEvent(pageEvent: any) {
    this.limit = pageEvent.pageSize;
    this.page = pageEvent.pageIndex;
    this.setLimitToLocalStorage(this.limit);
    this.searchImages().pipe(take(1)).subscribe(resp => {
      this.updateImageSearch();
      return this.onSearchSuccess(resp);
    }, () => {});
  }

  openImageCreateDialog() {
    if (!this.userIsAdmin) {
      this.alertService.danger('Only admins can rescan all images');
      return;
    }
    const openAddImage = this.dialog.open(CreateImageComponent, {
      width: '600px',
      closeOnNavigation: true,
      disableClose: true,
      data: {clusterId: this.clusterId}
    });
    openAddImage.afterClosed()
      .pipe(switchMap((result) => {
        return result === undefined
        ? this.searchImages()
        : of(null);
      }),
        take(1))
      .subscribe(resp => this.onSearchSuccess(resp), () => {});
  }

  openAdvancedSearchDialog() {
    const openAdvancedSearch = this.dialog.open(AdvancedSearchDialogComponent, {
      width: 'fit-content',
      closeOnNavigation: true,
      disableClose: false,
      data: { imageName: this.imageName, cve: this.cve, onlyRunning: this.onlyRunning}
    });
    openAdvancedSearch.afterClosed()
      .pipe(switchMap((result) => {
        return result
          ? this.searchImages(result.name, result.cve, result.onlyRunning)
          : of(null);
      }),
        take(1))
      .subscribe(resp => this.onSearchSuccess(resp), () => {});
  }

  openConfirmScanDialog() {
    const confirmScanAllDialog = this.dialog.open(ConfirmScanAllDialogComponent, {
      height: 'auto',
      width: 'auto',
      closeOnNavigation: true,
      disableClose: false,
      data: {images: this.dataSource.data},
    });
    confirmScanAllDialog.afterClosed()
      .subscribe((result) => {
        if (result?.continue && result?.selectedImages) {
          this.scanImages(result.selectedImages);
        } else {
          this.alertService.info('Scanning canceled');
        }
      });
  }

  scanImages(targetImages: number[]) {
    const filterImageIds = {
      imageIds: targetImages
    };
    this.imageService.scanImageModule(this.clusterId, filterImageIds)
      .pipe(
        catchError((err) => {
          this.alertService.danger(err.error.message);
          return of(null);
        }),
        switchMap((response) => {
          if (response?.success) {
            this.alertService.success('Image Scan queued');
          }
          return of(null);
        }),
        take(1)
      ).subscribe(resp => this.onSearchSuccess(resp), () => {});
  }

  getImageScannerDetails(row: IImage) {
    this.router.navigate(['/private', 'clusters', this.clusterId, 'images', 'image-scan', row.id]);
  }

  setLimitToLocalStorage(limit: number) {
    localStorage.setItem('image_table_limit', String(limit));
  }
  getLimitFromLocalStorage(): string | null {
    return localStorage.getItem('image_table_limit');
  }

  updateImageSearch() {}

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.updateImageSearch();
  }
}
