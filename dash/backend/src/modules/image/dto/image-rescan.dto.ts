import { Expose } from "class-transformer";
import { IsNumber, IsString } from "class-validator";

export class ImageRescanDto {
    @IsNumber()
    @Expose({ name: 'last_scanned'})
    lastScanned: number;

    @IsString()
    @Expose({ name: 'scan_results'})
    scanResults: string;
}
