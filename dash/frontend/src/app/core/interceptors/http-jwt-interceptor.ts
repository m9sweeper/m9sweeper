import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {NgxUiLoaderService} from 'ngx-ui-loader';

@Injectable()
export class HttpJwtInterceptor implements HttpInterceptor {

  constructor(private loaderService: NgxUiLoaderService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('__token__') || '';
    const modified = req.clone({
      setHeaders: {
        authorization: `Bearer ${token}`
      }
    });
    return next.handle(modified);
  }
}
