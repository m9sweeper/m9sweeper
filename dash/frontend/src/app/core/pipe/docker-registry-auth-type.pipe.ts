import { Pipe, PipeTransform } from '@angular/core';
import { DockerRegistryAuthTypes } from '../enum/DockerRegistryAuthTypes';

@Pipe({name: 'dockerRegistryAuthType'})
export class DockerRegistryAuthTypePipe implements PipeTransform {
  constructor() {}

  transform(authType: DockerRegistryAuthTypes): string {
    switch (authType) {
      case (DockerRegistryAuthTypes.GOOGLE_CONTAINER_REGISTRY):
        return 'Google Container Registry';
      case (DockerRegistryAuthTypes.AMAZON_CONTAINER_REGISTRY):
        return 'Amazon Container Registry';
      case (DockerRegistryAuthTypes.AZURE_CONTAINER_REGISTRY):
        return 'Azure Container Registry';
      default:
        return authType;
    }
  }
}
