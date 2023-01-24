import {Expose, Transform} from "class-transformer";
import {IsBoolean, IsJSON, IsNumber, IsOptional, IsString} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class FalcoSettingDto {
    @Expose({name: 'cluster_id', toPlainOnly: true})
    @ApiProperty()
    @IsOptional()
    clusterId: number;

    @Expose({name: 'send_notification_anomaly', toPlainOnly: true})
    @ApiProperty()
    @IsOptional()
    sendNotificationAnomaly: boolean;

    @Expose({name: 'anomaly_notification_frequency', toPlainOnly: true})
    @ApiProperty()
    @IsOptional()
    anomalyFrequency: number;

    @Expose({name: 'severity_level', toPlainOnly: true})
    @ApiProperty()
    @IsOptional()
    severityLevel: string;

    @Expose({name: 'send_notification_summary', toPlainOnly: true})
    @ApiProperty()
    @IsOptional()
    sendNotificationSummary: boolean

    @Expose({name: 'summary_notification_frequency', toPlainOnly: true})
    @ApiProperty()
    @IsOptional()
    summaryNotificationFrequency: string;

    @Expose({name: 'weekday', toPlainOnly: true})
    @ApiProperty()
    @IsOptional()
    weekday: string;

    @Expose({name: 'who_to_notify', toPlainOnly: true})
    @ApiProperty()
    @IsOptional()
    whoToNotify: string;

    @Expose({name: 'email_list', toPlainOnly: true})
    @ApiProperty()
    @IsOptional()
    emailList: string;

}
