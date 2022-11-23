import {Injectable, NestMiddleware, Scope} from '@nestjs/common';
import {Request, Response} from 'express';

@Injectable({scope: Scope.REQUEST})
export class LoggerMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: Function) {
        next();
    }
}
