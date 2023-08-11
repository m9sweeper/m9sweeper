import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Clipboard} from '@angular/cdk/clipboard';
import {AlertService} from 'src/app/core/services/alert.service';
import {Subject} from 'rxjs';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {map, takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-copy-to-clipboard-button',
  templateUrl: './copy-to-clipboard-button.component.html',
})
export class CopyToClipboardButtonComponent implements OnInit, OnDestroy {
  protected readonly unsubscribe$ = new Subject<void>();

  /** The text that will be copied to the user's clipboard when they click the button. */
  @Input() text: string;

  /** The message that will be shown in a toast if the data is copied. */
  @Input() successMessage = 'Text successfully copied to clipboard!';

  /** The message that will be shown in a toast if the text can't be copied. */
  @Input() errorMessage = 'Text could not be copied to clipboard.';

  /** Display only an icon as the button if true */
  @Input() iconButton = false;

  /** If set to true, will turn into an icon only button on small screens. Only checked on initialization */
  @Input() responsive = false;

  isSmallScreen: boolean;

  constructor(
    private cb: Clipboard,
    private readonly alertService: AlertService,
    protected readonly breakpointObserver: BreakpointObserver
    ) { }

  ngOnInit() {
    console.log('responsicv,', this.responsive);
    if (this.responsive) {
      this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.XSmall])
        .pipe(
          map(result => result.matches),
          takeUntil(this.unsubscribe$)
        ).subscribe({
        next: isSmall => this.isSmallScreen = isSmall
      });
    }
  }

  copy() {
    const success = this.cb.copy(this.text);
    if (success) {
      this.alertService.success(this.successMessage);
    } else {
      this.alertService.danger(this.errorMessage);
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
