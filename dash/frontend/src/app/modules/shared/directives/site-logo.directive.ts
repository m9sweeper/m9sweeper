import {Directive, ElementRef, OnDestroy, OnInit} from '@angular/core';
import {AppSettingsService} from '../../../core/services/app-settings.service';
import {Subscription} from 'rxjs';

@Directive({
  selector: '[appSiteLogo]'
})
export class SiteLogoDirective implements OnInit, OnDestroy {
  private siteSettingsChangeListener: Subscription;

  constructor(private el: ElementRef<HTMLImageElement>,
              private readonly appSettingsService: AppSettingsService) {
  }

  ngOnInit(): void {
    if (this.el.nativeElement.localName === 'img') {
      const cachedSiteLogo = localStorage.getItem('__site_logo__');
      if (cachedSiteLogo) {
        this.el.nativeElement.alt = localStorage.getItem('__site_title__');
        this.el.nativeElement.src = cachedSiteLogo;
      }

      this.appSettingsService.getSiteTitle().subscribe(response => {
        if (response.data) {
          localStorage.setItem('__site_title__', response.data);
          // this.appSettingsService.getSiteLogo().subscribe(blob => {
          //   this.parseAndCacheImage(blob);
          // });
        }
      }, error => {
          console.log('Site title loading error.', error);
      }, () => {
        // this.appSettingsService.getSiteLogo().subscribe(blob => {
        //   this.parseAndCacheImage(blob);
        // }, error => {
        //   console.log('Site title loading error.', error);
        // });
      });
      this.listenSiteSettingsChange();
    }
  }

  listenSiteSettingsChange() {
    this.siteSettingsChangeListener = this.appSettingsService.getUpdatedSettingsData().subscribe(data => {
      if (data.length > 0) {
        const siteName = data.find(setting => setting.name === 'SITE_NAME')?.value;
        localStorage.setItem('__site_title__', siteName);
        this.appSettingsService.getSiteLogo().subscribe(blob => {
          this.parseAndCacheImage(blob);
        });
      }
    });
  }

  private parseAndCacheImage(blob) {
    console.log('From ', SiteLogoDirective.name);
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      localStorage.setItem('__site_logo__', reader.result.toString());
      this.el.nativeElement.alt = localStorage.getItem('__site_title__');
      this.el.nativeElement.src = reader.result.toString();
    };
  }

  ngOnDestroy(): void {
    if (this.siteSettingsChangeListener) {
      this.siteSettingsChangeListener.unsubscribe();
    }
  }

}
