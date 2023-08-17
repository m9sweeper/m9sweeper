import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor, Scope } from '@nestjs/common';
import { MineLoggerService } from '../modules/shared/services/mine-logger.service';
import { Observable } from 'rxjs';

@Injectable({scope: Scope.DEFAULT})
export class InvalidClusterIdInterceptor implements NestInterceptor {
  private readonly CONTEXT = InvalidClusterIdInterceptor.name;

  constructor(private readonly logger: MineLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const clusterId = req.params?.clusterId;
    const parsedClusterId = parseInt(clusterId);
    if (!parsedClusterId) {
      throw new BadRequestException({message: 'Invalid cluster ID - must be a number', data: { clusterId }});
    }
    return next.handle();
  }
}
