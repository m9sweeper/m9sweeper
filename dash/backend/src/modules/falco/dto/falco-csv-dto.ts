import {IsString} from 'class-validator';

export class FalcoCsvDto {
    @IsString()
    filename: string;

    @IsString()
    csv: string;
}
