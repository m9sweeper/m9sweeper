import { DockerRegistryAuthTypes } from '../enum/DockerRegistryAuthTypes';
import { DockerRegistryAuthDetails } from '../types/DockerRegistryAuthDetails';

export interface IDockerRegistries {
  id: number;
  name: string;
  hostname: string;
  loginRequired: boolean;
  username: string;
  password?: string;
  authType?: DockerRegistryAuthTypes;
  authDetails?: DockerRegistryAuthDetails;
  aliases?: string[];
}
