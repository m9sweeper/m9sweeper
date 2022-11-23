import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {IsBoolean, IsNumber, IsOptional, IsString} from 'class-validator';


export class CommentDto{

    @Expose({name: 'id', toPlainOnly: true})
    @IsNumber()
    @IsOptional()
    @ApiProperty()
    id: number

    @Expose({name: 'exception_id', toPlainOnly: true})
    @IsNumber()
    @ApiProperty()
    exceptionId: number

    @Expose({name: 'user_id', toPlainOnly: true})
    @IsNumber()
    @ApiProperty()
    userId: number

    @Expose({name: 'content', toPlainOnly: true })
    @IsString()
    @ApiProperty()
    content: string;

    @Expose({name: 'user', toPlainOnly: true })
    @IsString()
    @IsOptional()
    @ApiProperty()
    user: string;

    @IsString()
    @IsOptional()
    @Expose({name: 'created_at', toPlainOnly: true})
    createdAt: number;

    @IsNumber()
    @IsOptional()
    @Expose({name: 'updated_at', toPlainOnly: true})
    updatedAt: number;

    @IsBoolean()
    @IsOptional()
    canDeleteThisComment: boolean;

}
