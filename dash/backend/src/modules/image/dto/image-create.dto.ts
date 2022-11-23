import {Expose} from 'class-transformer';
import {IsBoolean, IsNotEmpty, IsOptional, IsString, IsUrl} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


export class ImageCreateDto {

    @IsUrl()
    @IsNotEmpty()
    @Expose({ name: 'url', toPlainOnly:true })
    @ApiProperty({name: 'url'})
    url: string;

    @IsString()
    @IsNotEmpty()
    @Expose({name: 'name', toPlainOnly:true})
    @ApiProperty({name: 'name'})
    name: string;

    @IsString()
    @IsNotEmpty()
    @Expose({name: 'tag', toPlainOnly:true})
    @ApiProperty({name: 'tag'})
    tag: string;

    @IsBoolean()
    @IsOptional()
    @Expose({ name: 'running_in_cluster', toPlainOnly: true })
    @ApiProperty({ name: 'runningInCluster' })
    runningInCluster: boolean;
}
