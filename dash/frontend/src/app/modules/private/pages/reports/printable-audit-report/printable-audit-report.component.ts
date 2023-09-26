import { Component } from '@angular/core';
import {ReportsService} from '../../../../../core/services/reports.service';
import {take} from 'rxjs/operators';

@Component({
  selector: 'app-printable-audit-report',
  templateUrl: './printable-audit-report.component.html',
  styleUrls: ['./printable-audit-report.component.scss']
})
export class PrintableAuditReportComponent {
  constructor(protected readonly reportsService: ReportsService) {

  }

  generatePDF() {
    this.reportsService.generateSimpleSecurityAuditReport().pipe(take(1))
      .subscribe({
        next: (x) => console.log(x)
      });
  }

}
