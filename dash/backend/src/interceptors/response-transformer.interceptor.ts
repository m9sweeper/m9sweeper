import {CallHandler, ExecutionContext, Injectable, NestInterceptor, Scope} from '@nestjs/common';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {MineLoggerService} from '../modules/shared/services/mine-logger.service';
import * as url from 'url';

@Injectable({scope: Scope.DEFAULT})
export class ResponseTransformerInterceptor implements NestInterceptor {

    private readonly CONTEXT = ResponseTransformerInterceptor.name;

    constructor(private readonly logger: MineLoggerService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();
        const {statusCode} = context.switchToHttp().getResponse();

        this.logger.log({
            label: 'API_RESPONSE',
            data: {
                host: req.protocol + '://' + req.get('Host'),
                path: url.parse(req.originalUrl).pathname,
                referer: req.headers['referer'] ?? undefined,
                params: req.params,
                responseStatus: statusCode
            }
        }, this.CONTEXT);


        return next.handle().pipe(
            map(responseData => {
                return {
                    success: true,
                    message: '',
                    data: responseData ?? null
                };
            })
        );
    }
}
