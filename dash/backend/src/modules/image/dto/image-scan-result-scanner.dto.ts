import {Expose, Type} from 'class-transformer';
import {IsNumber, IsString} from 'class-validator';
import {ScanImageIssue} from './image-result.dto';

export class ImageScanResultScannerDto {

    @IsNumber()
    @Expose({ name: 'id', toPlainOnly:true })
    id: number;

    @IsString()
    @Expose({name: 'scanner_name', toPlainOnly:true})
    scannerName: string

    @IsString()
    @Expose({name: 'image_id', toPlainOnly:true})
    imageId: string

    @IsString()
    @Expose({name: 'summary', toPlainOnly: true})
    summary: string


    @Expose({ name: 'issues', toPlainOnly: true })
    @Type(() => ScanImageIssue)
    issues: ScanImageIssue[]

    @IsNumber()
    @Expose({name: 'critical_issues', toPlainOnly:true})
    criticalIssues: number

    @IsNumber()
    @Expose({name:'major_issues', toPlainOnly:true})
    majorIssues: number

    @IsNumber()
    @Expose({name: 'medium_issues', toPlainOnly:true})
    mediumIssues: number

    @IsNumber()
    @Expose({name:'low_issues', toPlainOnly:true})
    lowIssues: number

    @IsNumber()
    @Expose({name: 'negligible_issues', toPlainOnly:true})
    negligibleIssues: number

    @IsNumber()
    @Expose({name: 'created_at', toPlainOnly: true})
    createdAt: number;

    @IsNumber()
    @Expose({name: 'updated_at', toPlainOnly: true})
    updatedAt: number;
}
