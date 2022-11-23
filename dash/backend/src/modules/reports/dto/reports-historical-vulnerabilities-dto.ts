import {Expose} from "class-transformer";
import {IsNumber} from "class-validator";

export class ReportsHistoricalVulnerabilitiesDto {

    @Expose({name: 'saved_date'})
    savedDate: any;

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