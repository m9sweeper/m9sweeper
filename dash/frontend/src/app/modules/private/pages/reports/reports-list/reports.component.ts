import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { take, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { SharedSubscriptionService } from '../../../../../core/services/shared.subscription.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})

export class ReportsComponent implements OnInit, OnDestroy {
  clusterId: number;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sharedSubscriptionService: SharedSubscriptionService,
  ){}

  ngOnInit(): void {
    this.updateFormatting();

    this.route.parent.parent.params
      .pipe(take(1))
      .subscribe(param => this.clusterId = param.id);

    this.sharedSubscriptionService.getCurrentExpandStatus()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.updateFormatting();
      });
  }

  @HostListener('window:resize', ['$event'])
  setScreenSize($event?: any) {
    this.updateFormatting();
  }

  navigateVulnerabilityExport() {
    this.router.navigate(['/private', 'clusters', this.clusterId, 'reports', 'vulnerability-export']);
  }

  navigateImageVisualization() {
    this.router.navigate(['/private', 'clusters', this.clusterId, 'reports', 'vulnerability-visualization']);
  }

  navigateRunningVulnerabilities() {
    this.router.navigate(['/private', 'clusters', this.clusterId, 'reports', 'running-vulnerabilities']);
  }

  navigateHistoricalVulnerabilities() {
    this.router.navigate(['/private', 'clusters', this.clusterId, 'reports', 'historical-vulnerabilities']);
  }

  navigateWorstImages() {
    this.router.navigate(['/private', 'clusters', this.clusterId, 'reports', 'worst-images']);
  }

  navigateDifferenceOverTime() {
    this.router.navigate(['/private', 'clusters', this.clusterId, 'reports', 'vulnerability-difference-over-time']);
  }

  navigateDifferenceByDate() {
    this.router.navigate(['/private', 'clusters', this.clusterId, 'reports', 'vulnerability-difference-by-date']);
  }

  /** Adjust size and number per row of report cards based on the size of the container element instead of
   * the overall screen size. Allows card items to resize when the left navigation bar expands or contracts. */
  updateFormatting() {
    const screenWidth = +document.documentElement.style
      .getPropertyValue('--cluster-container-width')
      .replace('px', '');
    let className = 'reports-item ';
    if (screenWidth >= 1200) {
      className = className.concat('col-xs-4');
    } else if (screenWidth >= 900) {
      className = className.concat('col-xs-6');
    } else {
      className = className.concat('col-xs-12');
    }
    const cards = document.getElementsByClassName('reports-item');
    for (let i = 0; i < cards.length; i++) {
      const card = cards.item(i);
      card.className = className;
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
