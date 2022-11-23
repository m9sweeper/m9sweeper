import {IsString} from 'class-validator';
import {Expose} from 'class-transformer';
import {ApiProperty} from '@nestjs/swagger';

export class LoginDto {

    @IsString()
    @Expose({name: 'username'})
    @ApiProperty({name: 'username'})
    userName: string;

    @IsString()
    @Expose({name: 'password'})
    @ApiProperty({name: 'password'})
    userPassword: string;
}
