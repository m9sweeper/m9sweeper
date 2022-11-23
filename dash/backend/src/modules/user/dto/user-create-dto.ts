import {IsEmail, IsNumber, IsOptional, IsString, IsBoolean, ValidateNested} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';

// export enum UserAuthorities {
//     SUPER_ADMIN = 'SUPER_ADMIN',
//     ADMIN = 'ADMIN',
//     READ_ONLY = 'READ_ONLY'
// }

export class UserCreateDto {

    @IsString()
    @ApiProperty({name: 'firstName'})
    firstName:          string;

    @IsString()
    @ApiProperty({name: 'lastName'})
    lastName:           string;

    @IsEmail()
    @ApiProperty({name: 'email'})
    email:              string;

    @IsOptional()
    @ApiProperty({ name: 'password' })
    password: string;

    @IsOptional()
    @IsString()
    @ApiProperty({name: 'phone'})
    phone:              string;

    @IsNumber({},{each: true})
    @ApiProperty({name: 'authorities', type: Array(Number)})
    authorities: number[];

    @IsBoolean()
    @ApiProperty({name: 'isActive'})
    isActive:           boolean;
}
