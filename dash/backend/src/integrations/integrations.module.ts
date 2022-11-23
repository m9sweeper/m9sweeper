import {Global, Module} from '@nestjs/common';
import {LicensingPortalService} from "./licensing-portal/licensing-portal.service";
import {HttpModule} from "@nestjs/axios";

@Global()
@Module({
  imports: [HttpModule],
  providers: [
    // HttpService,
    LicensingPortalService,
  ],
  exports: [
    LicensingPortalService,
  ]
})
export class IntegrationsModule {}
