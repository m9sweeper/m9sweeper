import {IsJSON, IsNumber, IsOptional, IsString} from 'class-validator';
import {Expose, Transform} from 'class-transformer';
import {format} from 'date-fns';

export class FalcoDto {
    @Expose()
    @IsNumber()
    @IsOptional()
    id: number;

    @Expose({name: 'cluster_id', toPlainOnly: true})
    @IsNumber()
    clusterId: number;

    @Expose({name: 'creation_timestamp', toPlainOnly: true})
    @IsOptional()
    @IsNumber()
    timestamp: number;

    @Expose({name: 'calendar_date', toPlainOnly: true})
    @IsOptional()
    @IsString()
    @Transform(({value}) => {
        if (value instanceof Date) {
            value = format(value, 'yyyy-MM-dd');
        }
        return value;
    })
    calendarDate: string;

    @Expose({name: 'anomaly_signature', toPlainOnly: true})
    @IsString()
    @IsOptional()
    anomalySignature: string;

    @Expose({name: 'anomaly_signature_global', toPlainOnly: true})
    @IsString()
    @IsOptional()
    anomalySignatureGlobal: string;

    @Expose()
    @IsString()
    rule: string;

    @Expose()
    @IsString()
    namespace: string;

    @Expose()
    @IsString()
    image: string;

    @Expose()
    @IsString()
    container: string;

    @Expose()
    @IsString()
    level: string; /** Probably make this an enum when we get the specs */

    @IsJSON()
    @Expose()
    raw: object;

    @IsOptional()
    @Expose()
    @IsString()
    message: string;
}
