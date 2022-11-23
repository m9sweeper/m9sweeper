import { Global, Module } from '@nestjs/common';
import { InfoService } from "./services/info.service";
import { InfoController } from "./controllers/info.controller";
import {SharedModule} from '../shared/shared.module';

@Global()
@Module({
  providers: [
      InfoService
  ],
  exports: [
    InfoService
  ],
  imports: [
      SharedModule
  ],
  controllers: [InfoController]
})
export class InfoModule {}
