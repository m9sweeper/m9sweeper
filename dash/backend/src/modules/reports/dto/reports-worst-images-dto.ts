import {Expose, Transform} from 'class-transformer';
import {IsNumber, IsString} from 'class-validator';
import {format} from 'date-fns';

class BaseReportsWorstImagesDto {

    @Expose({name: 'criticalImages'})
    @IsNumber()
    criticalImages: number;

    @Expose({name: 'majorImages'})
    @IsNumber()
    majorImages: number;

    @Expose({name: 'mediumImages'})
    @IsNumber()
    mediumImages: number;

    @Expose({name: 'lowImages'})
    @IsNumber()
    lowImages: number;

    @Expose({name: 'negligibleImages'})
    @IsNumber()
    negligibleImages: number;

    @Expose({name: 'safeImages'})
    @IsNumber()
    safeImages: number;
}

export class ReportsWorstImagesDto extends BaseReportsWorstImagesDto {
    @Expose({name: 'savedDate'})
    @IsString()
    @Transform(({value: savedDate}) => format(savedDate, 'yyyy-MM-dd'), {toClassOnly: true})
    savedDate: string;
}

export class ReportsCurrentWorstImagesDto extends BaseReportsWorstImagesDto {
    @Expose({name: 'unscannedImages'})
    @IsNumber()
    unscannedImages: number;

    @Expose({name: 'totalImages'})
    @IsNumber()
    totalImages: number;
}
