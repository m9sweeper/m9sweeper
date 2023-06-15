import {HttpException, HttpStatus, Inject, Injectable} from '@nestjs/common';
import { DockerRegistriesDto } from '../dto/docker-registries-dto';
import { DockerRegistriesDao } from '../dao/docker-registries.dao';
import {DockerRegistriesDataDto} from '../open-api-schema/docker-registries-schema';
import {UtilitiesService} from '../../shared/services/utilities.service';
import {UserProfileDto} from '../../user/dto/user-profile-dto';
import {AuditLogService} from '../../audit-log/services/audit-log.service';

@Injectable()
export class DockerRegistriesService {
  private readonly entityType: string = 'DockerRegistry';
  constructor(private readonly dockerRegistriesDao: DockerRegistriesDao,
              @Inject('LOGGED_IN_USER') private readonly _loggedInUser: UserProfileDto,
              private readonly utilitiesService: UtilitiesService,
              private readonly auditLogService: AuditLogService){}

  async createDockerRegistry(dockerRegistry: DockerRegistriesDto): Promise<DockerRegistriesDto> {
    const checkDockerRegistryByName = await this.getDockerRegistryIds({
      name: dockerRegistry.name,
      urls: (dockerRegistry.aliases && dockerRegistry.aliases.length > 0) ?
          [dockerRegistry.hostname].concat(dockerRegistry.aliases) : [dockerRegistry.hostname]
    });

    if(checkDockerRegistryByName && checkDockerRegistryByName.length > 0){
      throw new HttpException({status: HttpStatus.BAD_REQUEST, message: 'Docker registry name/hostname already in use.',
        entityType: this.entityType}, HttpStatus.BAD_REQUEST)
    }
    const dockerRegistryId = await this.dockerRegistriesDao.createDockerRegistry(dockerRegistry);
    return this.dockerRegistriesDao.getDockerRegistryById(dockerRegistryId);
  }

  async getDockerRegistryById(id: number, removeSensitiveInfo = true): Promise<DockerRegistriesDto> {
    let registry = await this.dockerRegistriesDao.getDockerRegistryById(id);
    if (removeSensitiveInfo) {
      registry = this.removeSensitiveInfo(registry);
    }
    return registry;
  }

  async getDockerRegistryIds(options: {name?: string, urls?: string[], idToExclude?: number}): Promise<number[]> {
    return this.dockerRegistriesDao.getDockerRegistryIds(options)
        .then(response => response.map(registry => registry.id));
  }

  async updateDockerRegistry(dockerRegistry: DockerRegistriesDto, id: number): Promise<number> {
    const checkDockerRegistryByName = await this.getDockerRegistryIds({
      name: dockerRegistry.name,
      urls: (dockerRegistry.aliases && dockerRegistry.aliases.length > 0) ?
          [dockerRegistry.hostname].concat(dockerRegistry.aliases) : [dockerRegistry.hostname],
      idToExclude: id
    });
    if(checkDockerRegistryByName && checkDockerRegistryByName.length > 0){
      throw new HttpException({status: HttpStatus.BAD_REQUEST, message: 'Docker registry name/hostname already in use.',
        entityType: this.entityType, entityId: id}, HttpStatus.BAD_REQUEST)
    }
    return this.dockerRegistriesDao.updateDockerRegistry(dockerRegistry,id);
  }

  async getDockerRegistries(searchOptions?: {page?: number, limit?: number, sortField?: string, sortDirection?: string,
    loginRequired?: string, authType?: string, url?: string}, removeSensitiveInfo = true)
      : Promise<DockerRegistriesDataDto> {

    const listData = await this.dockerRegistriesDao.getDockerRegistries(searchOptions);
    const totalCount = await this.dockerRegistriesDao.countTotalRegistries();

    if (removeSensitiveInfo) {
      listData.map(registry => this.removeSensitiveInfo(registry));
    }
    return {totalCount: +totalCount, list: listData};
  }


  async deleteDockerRegistryById(id: number): Promise<number>{
    return this.dockerRegistriesDao.deleteDockerRegistryById(id);
  }

  async calculatePolicyMetadata(previous: DockerRegistriesDto, updated: DockerRegistriesDto): Promise<any> {
    return await this.auditLogService.calculateMetaData(previous, updated, 'DockerRegistry');
  }

  /** Will remove the sensitive properties (username, password, authDetails)
   *  from a DockerRegistriesDto and return the clean version.
   * */
  removeSensitiveInfo(registry: DockerRegistriesDto): DockerRegistriesDto {
    if (!!registry) {
      delete registry.username;
      delete registry.password;
      delete registry.authDetails;
    }

    return registry;
  }
}
