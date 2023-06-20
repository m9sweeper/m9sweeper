import { Injectable } from '@nestjs/common';
import {ExceptionsService} from "../../exceptions/services/exceptions.service";
import {ExceptionType} from "../../exceptions/enum/ExceptionType";


/**
 * These commands are used to go through every exception and update their status to inactive if the exception is expired
 */
@Injectable()
export class SyncExceptionStatusCommand {

    constructor(
        private readonly exceptionsService: ExceptionsService,
    ) {}

    async syncExceptionStatus(): Promise<boolean> {
        let exceptions = await this.exceptionsService.getAllExceptions();
        exceptions = exceptions.filter(e => e.end_date && new Date(e.end_date) < new Date());
        await Promise.all(exceptions.map(e => this.exceptionsService.updateExceptionStatus(e.id, ExceptionType.INACTIVE)));
        return true;
    }
}
