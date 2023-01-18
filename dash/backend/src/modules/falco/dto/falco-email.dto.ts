import {Expose, Transform} from "class-transformer";
import {IsBoolean, IsJSON, IsNumber, IsOptional, IsString} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";
import {format} from "date-fns";

export class FalcoEmailDto {
    @Expose({name: 'id', toPlainOnly: true})
    @ApiProperty()
    @IsOptional()
    @IsNumber()
    Id: number;

    @Expose({name: 'creation_timestamp', toPlainOnly: true})
    @ApiProperty()
    @IsOptional()
    @IsNumber()
    creationTimestamp: number ;

    @Expose({name: 'calendar_date', toPlainOnly: true})
    @ApiProperty()
    @IsOptional()
    @IsString()
    @Transform(({value}) => {
        if (value instanceof Date) {
            value = format(value, 'yyyy-MM-dd');
        }
        return value;
    })
    calendarDate: string;

    @Expose({name: 'cluster_id', toPlainOnly: true})
    @ApiProperty()
    @IsOptional()
    @IsNumber()
    clusterId: number;

    @Expose({name: 'anomaly_signature', toPlainOnly: true})
    @IsOptional()
    @IsString()
    anomalySignature: string;
}
