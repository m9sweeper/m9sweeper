import { Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class GateKeeperConstraintDto {
    @Expose()
    @IsOptional()
    @IsOptional()
    name: string;

    @Expose()
    @IsString()
    @IsOptional()
    uid: string;

    @Expose()
    @IsString()
    @IsOptional()
    creationTimestamp: string;

    @Expose()
    @IsString()
    @IsOptional()
    regos: string[];


}

