import {ExceptionFilter, Catch, ArgumentsHost, HttpException, BadRequestException} from '@nestjs/common';
import {Request, Response} from 'express';
import {MineLoggerService} from '../modules/shared/services/mine-logger.service';
import * as url from "url";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {

  private readonly CONTEXT = HttpExceptionFilter.name;

  constructor(
    private readonly logger: MineLoggerService,
  ) {}

  catch(exception: HttpException, host: ArgumentsHost): void {
    // parse request details
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // build response
    const status = exception.getStatus();

    let errorMessage = exception.message;


    let data = null;
    if (typeof exception.getResponse === 'function') {
      const respFromException: any = exception.getResponse();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (typeof respFromException !== 'string' && respFromException?.data) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        data = respFromException?.data;
      } else if (typeof respFromException !== 'string' && respFromException?.response?.data) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        data = respFromException.response.data;
      }
    }

    if (
      exception instanceof BadRequestException &&
      typeof exception.getResponse === 'function' &&
      (<any>exception.getResponse())?.message
    ) {
      if ((<any>exception.getResponse()).message && Array.isArray((<any>exception.getResponse()).message)) {
        errorMessage = (<any>exception.getResponse()).message?.join(', ');
      }
    }

    if (!['/auth/validate'].includes(url.parse(request.originalUrl).pathname)) {
      this.logger.error(
        {
          label: errorMessage,
          data: {
            host: request.protocol + '://' + request.get('Host'),
            path: url.parse(request.originalUrl).pathname,
            params: request.params,
            responseStatus: status,
          }
        },
        exception,
        this.CONTEXT,
      );
    }

    response
      .status(status)
      .json({
        success: false,
        message: errorMessage,
        data,
      });
  }
}
