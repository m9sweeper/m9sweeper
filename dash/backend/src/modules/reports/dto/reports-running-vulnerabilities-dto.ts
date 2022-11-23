import {Expose, Transform} from 'class-transformer';
import {IsArray, IsNumber, IsOptional, IsString} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';
import {format} from 'date-fns';

export class ReportsRunningVulnerabilitiesDto {

    @Expose({name: 'image_id', toPlainOnly: true})
    @IsNumber()
    @ApiProperty({name: 'imageId'})
    imageId: number;

    @Expose({name: 'image', toPlainOnly: true})
    @IsString()
    @ApiProperty({name: 'image'})
    image: string;

    @Expose({name: 'namespaces'})
    @IsArray()
    @ApiProperty({name: 'namespaces'})
    namespaces: string[];

    @Expose({name: 'scan_results'})
    @IsString()
    scanResults: string;

    /** last_scanned returns either a Date object when pulling from historical data, or a UNIX timestamp when pulling
     * from current data. The transform standardizes both formats into an ISO string for use by the frontend. */
    @Expose({name: 'last_scanned'})
    @IsString()
    @Transform(
        ({value: lastScanned}) => {
            if (!lastScanned) {
                return;
            } else if (lastScanned instanceof Date) {
                return format(lastScanned, 'yyyy-MM-dd');
            } else {
                return format(new Date(parseInt(lastScanned)), 'yyyy-MM-dd');
            }
        },
        {toClassOnly: true}
    )
    @IsOptional()
    lastScanned: string;

    @Expose({name: 'total_critical'})
    @IsNumber()
    totalCritical: number;

    @Expose({name: 'total_major'})
    @IsNumber()
    totalMajor: number;

    @Expose({name: 'total_medium'})
    @IsNumber()
    totalMedium: number;

    @Expose({name: 'total_low'})
    @IsNumber()
    totalLow: number;

    @Expose({name: 'total_negligible'})
    @IsNumber()
    totalNegligible: number;

    @Expose({name: 'total_fixable_critical'})
    @IsNumber()
    totalFixableCritical: number;

    @Expose({name: 'total_fixable_major'})
    @IsNumber()
    totalFixableMajor: number;

    @Expose({name: 'total_fixable_medium'})
    @IsNumber()
    totalFixableMedium: number;

    @Expose({name: 'total_fixable_low'})
    @IsNumber()
    totalFixableLow: number;

    @Expose({name: 'total_fixable_negligible'})
    @IsNumber()
    totalFixableNegligible: number;
}
