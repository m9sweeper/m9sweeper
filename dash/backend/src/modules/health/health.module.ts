import { Global, Module } from '@nestjs/common';
import { HealthDao } from "./dao/health.dao";
import { HealthService } from "./services/health.service";
import { HealthController } from "./controllers/health.controller";

@Global()
@Module({
  providers: [HealthDao, HealthService],
  exports: [
    HealthDao,
    HealthService
  ],
  controllers: [HealthController]
})
export class HealthModule {}
