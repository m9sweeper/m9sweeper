import {IsNumber} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class ImageScanCreateDto {
    @IsNumber({},{each: true})
    @ApiProperty({name: 'imageIds', type: Array(Number)})
    imageIds: number[];
}
