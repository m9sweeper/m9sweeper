import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { DockerRegistryAuthDetails } from '../types/docker-registry-auth-details';
import { DockerRegistryAuthTypes } from '../../shared/enums/docker-registry-auth-types';


export class DockerRegistriesDto {

  @Expose({name: 'id', toPlainOnly: true})
  @ApiProperty()
  @IsOptional()
  id: number;

  @Expose({name: 'name', toPlainOnly: true})
  @IsOptional()
  @ApiProperty()
  name: string;

  @Expose({name: 'hostname', toPlainOnly: true})
  @IsOptional()
  @ApiProperty()
  hostname: string;

  @Expose({name: 'login_required', toPlainOnly: true})
  @IsOptional()
  @ApiProperty()
  loginRequired: boolean;

  @Expose({name: 'username', toPlainOnly: true})
  @IsOptional()
  @ApiProperty()
  username: string;

  @Expose({name: 'password', toPlainOnly: true})
  @IsOptional()
  @ApiProperty()
  password: string;

  @Expose({name: 'auth_type', toPlainOnly: true})
  @IsOptional()
  @ApiProperty()
  authType: DockerRegistryAuthTypes;

  @Expose({name: 'auth_details', toPlainOnly: true})
  @IsOptional()
  @ApiProperty()
  authDetails: DockerRegistryAuthDetails;

  @IsOptional()
  @IsString({each: true})
  @ApiProperty({name: 'aliases', type: Array(String)})
  aliases: string[];

  createdAt: number;

  updatedAt: number;

  deletedAt: number;

  @IsOptional()
  metadata: any;

}
