import {IsString, MaxLength} from 'class-validator';
import {Expose} from 'class-transformer';
import {ApiProperty} from '@nestjs/swagger';
import {SettingsType} from "../enums/settings-enums";

export class AppSettingsDto {

    @IsString()
    @Expose({name: 'name'})
    @ApiProperty()
    name: SettingsType;

    @MaxLength(255)
    @Expose({name: 'value'})
    @ApiProperty({})
    value: string;
}
