import {IsString} from 'class-validator';

export class ReportsCsvDto {
    @IsString()
    filename: string;

    @IsString()
    csv: string;
}
