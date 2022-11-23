import { Global, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import {ExceptionsDao} from "./dao/exceptions.dao";
import {ExceptionsService} from "./services/exceptions.service";
import {ExceptionController} from "./controllers/exception.controller";

@Global()
@Module({
    providers: [ExceptionsDao, ExceptionsService],
    imports: [
        ScheduleModule.forRoot()
    ],
    exports: [
        ExceptionsDao,
        ExceptionsService
    ],
    controllers: [ExceptionController]
})
export class ExceptionsModule {}
