import {ApiProperty} from '@nestjs/swagger';

export abstract class StandardResponse {

    @ApiProperty()
    success: boolean;

    @ApiProperty()
    message: string;
}
