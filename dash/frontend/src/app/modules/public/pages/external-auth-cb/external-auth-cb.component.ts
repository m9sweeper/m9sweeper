import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JwtAuthService } from '../../../../core/services/jwt-auth.service';
import { AuthService } from '../../../../core/services/api/auth.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-external-auth-cb',
  templateUrl: './external-auth-cb.component.html',
  styleUrls: ['./external-auth-cb.component.scss']
})
export class ExternalAuthCbComponent implements OnInit, OnDestroy {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private jwtService: JwtAuthService,
    private loaderService: NgxUiLoaderService
  ) {}

  ngOnInit(): void {
    this.loaderService.start('external-auth-handler-page-loader');
    const token: string = this.route.snapshot.params.code;
    if (token !== null && token.trim() !== '') {
      this.jwtService.saveToken(token);
      this.router.navigate(['/private']).then(() => {
        this.loaderService.stop('external-auth-handler-page-loader');
      });
    } else {
      this.router.navigate(['/']).then(() => {
        this.loaderService.stop('external-auth-handler-page-loader');
      });
    }
  }

  ngOnDestroy(): void {}

}
