import {IsEmail, IsString} from 'class-validator';
import {Expose} from 'class-transformer';
import {ApiProperty} from '@nestjs/swagger';
import email from '../../../config/email';

export class ChangePasswordDto {
    @IsString()
    @Expose()
    @ApiProperty({name: 'currentPassword'})
    currentPassword: string;

    @IsString()
    @Expose()
    @ApiProperty({name: 'password'})
    password: string;

    @IsString()
    @Expose()
    @ApiProperty({name: 'confirmPassword'})
    confirmPassword: string;
}
