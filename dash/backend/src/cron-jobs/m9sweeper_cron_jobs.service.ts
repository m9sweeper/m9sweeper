import {Injectable} from "@nestjs/common";
import {PrometheusService} from "../modules/shared/services/prometheus.service";
import {ImageService} from "../modules/image/services/image.service";
import {Cron} from "@nestjs/schedule";
import {ExceptionsService} from "../modules/exceptions/services/exceptions.service";
import {formatDistance} from "date-fns";
import { MineLoggerService } from '../modules/shared/services/mine-logger.service';

@Injectable()
export class M9sweeperCronJobService {
    constructor(
        private readonly loggerService: MineLoggerService,
        private readonly prometheusService: PrometheusService,
        private readonly imageService: ImageService,
        private readonly exceptionsService: ExceptionsService,
    ) {}

    /**
     * Recompile M9sweeper Metrics every 30s for Prometheus metrics
     */
    @Cron('*/30 * * * * *')
    async updateExceptionAndImageMetrics() {
        const activeExceptions = await this.exceptionsService.getAllActiveExceptions();
        const activeExceptionsCount = activeExceptions ? activeExceptions.length : 0;
        this.prometheusService.activeExceptions.set(activeExceptionsCount);
        // this.loggerService.log({label: `Total number of active exceptions: ${activeExceptionsCount}`});

        const exceptionsExpireTomorrow = await this.exceptionsService.getExceptionsExpireTomorrow(M9sweeperCronJobService.getTomorrowDate());
        const exceptionsExpireTomorrowCount =exceptionsExpireTomorrow ? exceptionsExpireTomorrow.length : 0;
        this.prometheusService.expiringExceptionsTomorrow.set(exceptionsExpireTomorrowCount);
        // this.loggerService.log({label: `Total number of active exceptions expiring tomorrow: ${exceptionsExpireTomorrowCount}`});

        const totalCompliantImages = await this.imageService.getAllImagesByCompliance('Compliant');
        this.prometheusService.numOfCompliantImages.set(+totalCompliantImages.shift().count);
        // this.loggerService.log({label: `Total number of compliant images: ${+totalCompliantImages.shift().count}`});

        const totalNonCompliantImages = await this.imageService.getAllImagesByCompliance('Non-compliant');
        this.prometheusService.numOfNonCompliantImages.set(+totalNonCompliantImages.shift().count);
        // this.loggerService.log({label: `Total number of non-compliant images: ${+totalNonCompliantImages.shift().count}`});

        const totalUnScannedImages = await this.imageService.getAllImagesByCompliance(null);
        this.prometheusService.numOfUnScannedImages.set(+totalUnScannedImages.shift().count);
        // this.loggerService.log({label: `Total number of unscanned images: ${+totalUnScannedImages.shift().count}`});

        for (const exception of activeExceptions) {
            this.prometheusService.activeException
                .labels(exception.title, exception.endDate ? formatDistance(new Date(exception.endDate), new Date(), { addSuffix: true }) : null)
                .observe(100);
        }
    }

    private static getTomorrowDate() {
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        return tomorrow.toISOString();
    }
}
