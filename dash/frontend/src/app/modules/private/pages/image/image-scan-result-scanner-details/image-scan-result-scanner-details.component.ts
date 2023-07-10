import { Component, OnInit } from '@angular/core';
import {ImageService} from '../../../../../core/services/image.service';
import {ActivatedRoute, Router} from '@angular/router';
import {AlertService} from '@full-fledged/alerts';
import {FormatDate} from '../../../../shared/format-date/format-date';
import {IServerResponse} from '../../../../../core/entities/IServerResponse';
import {IScanResult} from '../../../../../core/entities/IImage';

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
    private alertService: AlertService) {
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
      this.alertService.danger(error.error.message);
      this.router.navigate(['/private']);
    });
  }

}
