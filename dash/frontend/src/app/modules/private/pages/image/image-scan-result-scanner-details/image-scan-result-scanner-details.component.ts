import { Component, OnInit } from '@angular/core';
import {ImageService} from '../../../../../core/services/image.service';
import {ActivatedRoute, Router} from '@angular/router';
import {FormatDate} from '../../../../shared/format-date/format-date';
import {IServerResponse} from '../../../../../core/entities/IServerResponse';
import {IScanResult} from '../../../../../core/entities/IImage';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-image-scan-result-scanner-details',
  templateUrl: './image-scan-result-scanner-details.component.html',
  styleUrls: ['./image-scan-result-scanner-details.component.scss']
})

export class ImageScanResultScannerDetailsComponent implements OnInit {

  clusterId: number;
  imageId: number;
  scannerId: number;
  scanDetails: IScanResult;
  formatDate = FormatDate.formatLastScannedDate;

  constructor(
    private imageService: ImageService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {
    this.imageId = +this.route.snapshot.paramMap.get('imageId');
    this.scannerId = +this.route.snapshot.paramMap.get('scannerId');
  }

  ngOnInit(): void {
    this.route.parent.parent.params.subscribe(param => {
      this.clusterId = param.id;
    });
    this.imageService.getScanImageScannerDetails(this.clusterId, this.imageId, this.scannerId).subscribe((response: IServerResponse<IScanResult>) => {
      this.scanDetails = response.data;
    }, error => {
      this.snackBar.open(error.error.message, 'Close', { duration: 2000});
      this.router.navigate(['/private']);
    });
  }

}
