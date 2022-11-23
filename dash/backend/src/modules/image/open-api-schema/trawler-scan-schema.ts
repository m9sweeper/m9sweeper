import {StandardResponse} from '../../shared/dto/response.dto';
import {ApiProperty} from '@nestjs/swagger';
import {IsBoolean, IsNumber} from 'class-validator';

export const TRAWLER_RESPONSE_SCHEMA = {
    "type": "object",
    "required": [
        "success",
        "message",
        "data"
    ],
    "properties": {
        "success": {
            "type": "boolean"
        },
        "message": {
            "type": "string"
        },
        "data": {
            "type": "object",
            "required":[
                "id",
            ],
            "properties":{
                "id":{
                    "type": "number"
                },
            }

        }
    }
};

export class ImageScanResultDto {
    @ApiProperty()
    @IsBoolean()
    complaint: boolean;
}

export class ImageScanResultSaveResponse extends StandardResponse {

    @ApiProperty({ type: () => ImageScanResultDto })
    data: ImageScanResultDto;
}
