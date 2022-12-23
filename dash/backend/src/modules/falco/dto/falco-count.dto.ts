import {Expose} from "class-transformer";
import {ApiProperty} from "@nestjs/swagger";
import {IsOptional} from "class-validator";

export class FalcoCountDto {

    @Expose({name: 'count', toPlainOnly: true})
    @ApiProperty()
    @IsOptional()
    count: number;

    @Expose({name: 'calendar_date', toPlainOnly: true})
    @IsOptional()
    @ApiProperty()
    date: Date;
}

