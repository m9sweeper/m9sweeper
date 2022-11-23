import {Expose, Transform, Type} from 'class-transformer';
import {IsBoolean, IsNumber, IsOptional, IsString} from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class ImageDto {

    @IsNumber()
    @Expose({ name: 'id', toPlainOnly:true})
    id: number

    @IsString()
    @Expose({ name: 'url', toPlainOnly:true })
    url: string

    @IsString()
    @Expose({name: 'name', toPlainOnly:true})
    name: string

    @IsString()
    @Expose({name: 'tag', toPlainOnly:true})
    tag: string

    @IsString()
    @Expose({name: 'docker_image_id', toPlainOnly: true})
    dockerImageId: string

    @IsString()
    @Expose({name:'summary', toPlainOnly:true})
    summary:string

    @IsNumber()
    @IsOptional()
    @Expose({name: 'critical_issues', toPlainOnly:true})
    criticalIssues: number

    @IsNumber()
    @IsOptional()
    @Expose({name:'major_issues', toPlainOnly:true})
    majorIssues: number

    @IsNumber()
    @IsOptional()
    @Expose({name: 'medium_issues', toPlainOnly:true})
    mediumIssues: number

    @IsNumber()
    @IsOptional()
    @Expose({name:'low_issues', toPlainOnly:true})
    lowIssues: number

    @IsNumber()
    @IsOptional()
    @Expose({name: 'negligible_issues', toPlainOnly:true})
    negligibleIssues: number

    @IsBoolean()
    @IsOptional()
    @Expose({name: 'running_in_cluster', toPlainOnly:true})
    runningInCluster: boolean

    @IsBoolean()
    @IsOptional()
    @Expose({name: 'scan_queued', toPlainOnly:true})
    scanQueued: boolean

    @IsString()
    @IsOptional()
    @Expose({name: 'image', toPlainOnly: true})
    image: string
}
