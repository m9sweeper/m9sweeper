import {FalcoOutputFieldsDto} from './falco-output-fields.dto';
import {Expose, Type} from 'class-transformer';
import {IsString, ValidateNested} from 'class-validator';

export class FalcoWebhookInputDto {
    @Expose()
    @IsString()
    hostname: string;

    @Expose()
    @IsString()
    output: string;

    @Expose()
    @IsString()
    priority: string;

    @Expose()
    @IsString()
    rule: string;

    @Expose()
    @IsString()
    source: string;

    @Expose()
    @IsString({each: true})
    tags: string[];

    @Expose()
    @IsString()
    time: string;

    @Expose({name: 'output_fields'})
    @Type(() => FalcoOutputFieldsDto)
    @ValidateNested()
    outputFields: FalcoOutputFieldsDto;
}
