import {IsEmail, IsString} from 'class-validator';
import {Expose} from 'class-transformer';
import {ApiProperty} from '@nestjs/swagger';
import email from '../../../config/email';

export class PreResetPasswordDto {

    @IsEmail()
    @Expose()
    @ApiProperty({name: 'email'})
    email: string;
}
