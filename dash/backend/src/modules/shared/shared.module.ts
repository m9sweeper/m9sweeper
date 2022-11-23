import {Global, Module} from '@nestjs/common';
import {DatabaseService} from './services/database.service';
import {MineLoggerService} from './services/mine-logger.service';
import {FileUploadService} from './services/file-upload.service';
import {FileManagementController} from './controllers/file-management.controller';
import {MulterModule} from '@nestjs/platform-express';
import {FileManagementService} from './services/file-management.service';
import {FileManagementDao} from './dao/file-management.dao';
import {HandlebarsAdapter, MailerModule} from '@nestjs-modules/mailer';
import {EmailService} from './services/email.service';
import { ConfigService } from "@nestjs/config";
import {RabbitMQService} from './services/RabbitMQService';
import {MessagingService} from './services/messaging-service';
import {UtilitiesService} from './services/utilities.service';
import {CommonController} from './controllers/common.controller';
import {CsvService} from './services/csv.service';
import {prometheusCounters} from './utilities/prometheus_counters';
import {prometheusGauges} from "./utilities/prometheus_gauges";
import {PrometheusService} from './services/prometheus.service';
import {prometheusSummaries} from "./utilities/prometheus_summaries";

@Global()
@Module({
    imports: [
        MulterModule.registerAsync({
            useClass: FileUploadService
        }),
        MailerModule.forRootAsync({
            useFactory: async (configService: ConfigService) => ({
                transport: (() => {
                    return {
                        host: configService.get('email.smtp.host'),
                        port: configService.get('email.smtp.port'),
                        secure: configService.get('email.smtp.secure'),
                        auth: {
                            user: configService.get('email.smtp.auth.user'),
                            pass: configService.get('email.smtp.auth.password')
                        }
                    }
                })(),
                defaults: {
                    from: configService.get('email.default.sender')
                },
                template: {
                    dir: configService.get('email.templateDir'),
                    adapter: new HandlebarsAdapter(),
                    options: {
                        strict: true
                    },
                },
            }),
            inject: [ConfigService]
        }),
    ],
    exports: [
        DatabaseService,
        MineLoggerService,
        FileManagementService,
        EmailService,
        RabbitMQService,
        MessagingService,
        UtilitiesService,
        CsvService,
        PrometheusService,
    ],
    controllers: [
        FileManagementController,
        CommonController
    ],
    providers: [
        DatabaseService,
        MineLoggerService,
        FileUploadService,
        FileManagementService,
        FileManagementDao,
        EmailService,
        RabbitMQService,
        MessagingService,
        UtilitiesService,
        CsvService,
        PrometheusService,
        ...prometheusCounters,
        ...prometheusGauges,
        ...prometheusSummaries,
    ]
})
export class SharedModule {
}
