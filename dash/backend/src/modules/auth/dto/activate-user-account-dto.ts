import {IsString} from 'class-validator';
import {Expose} from 'class-transformer';
import {ApiProperty} from '@nestjs/swagger';

export class ActivateUserAccountDto {

    @IsString()
    @Expose()
    @ApiProperty({name: 'token'})
    token: string;

    @IsString()
    @Expose()
    @ApiProperty({name: 'password'})
    password: string;

    @IsString()
    @Expose()
    @ApiProperty({name: 'confirmPassword'})
    confirmPassword: string;
}
