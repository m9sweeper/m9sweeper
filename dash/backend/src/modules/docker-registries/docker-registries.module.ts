import { Global, Module } from '@nestjs/common';
import { DockerRegistriesDao } from "./dao/docker-registries.dao";
import { DockerRegistriesController } from "./controllers/docker-registries.controller";
import { DockerRegistriesService} from "./services/docker-registries.service";

@Global()
@Module({
  providers: [DockerRegistriesDao, DockerRegistriesService],
  exports: [
    DockerRegistriesDao,
    DockerRegistriesService
  ],
  controllers: [DockerRegistriesController]
})
export class DockerRegistriesModule {}
