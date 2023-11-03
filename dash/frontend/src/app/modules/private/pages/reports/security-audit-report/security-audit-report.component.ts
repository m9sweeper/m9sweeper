import { Component } from '@angular/core';
import {ReportsService} from '../../../../../core/services/reports.service';
import {take} from 'rxjs/operators';

@Component({
  selector: 'app-security-audit-report',
  templateUrl: './security-audit-report.component.html',
  styleUrls: ['./security-audit-report.component.scss']
})
export class SecurityAuditReportComponent {
  constructor(protected readonly reportsService: ReportsService) {

  }

  generatePDF() {
    this.reportsService.generateSimpleSecurityAuditReport().pipe(take(1))
      .subscribe({
        next: (x) => console.log(x)
      });
  }

}
