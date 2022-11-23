import {Expose, Transform} from 'class-transformer';
import {IsNumber, IsString} from 'class-validator';
import {format} from 'date-fns';

export class ReportsWorstImagesDto {
    @Expose({name: 'savedDate'})
    @IsString()
    @Transform(({value: savedDate}) => format(savedDate, 'yyyy-MM-dd'), {toClassOnly: true})
    savedDate: string;

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
