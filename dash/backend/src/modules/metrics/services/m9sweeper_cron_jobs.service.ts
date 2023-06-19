import {Injectable} from "@nestjs/common";
import {PrometheusV1Service} from "./prometheus-v1.service";
import {ImageService} from "../../image/services/image.service";
import {Cron} from "@nestjs/schedule";
import {ExceptionsService} from "../../exceptions/services/exceptions.service";
import {formatDistance} from "date-fns";
import { MineLoggerService } from "../../shared/services/mine-logger.service";


@Injectable()
export class M9sweeperCronJobService {
    constructor(
        private readonly loggerService: MineLoggerService,
        private readonly prometheusService: PrometheusV1Service,
        private readonly imageService: ImageService,
        private readonly exceptionsService: ExceptionsService,
    ) {}

    /**
     * Recompile M9sweeper Metrics every 30s for Prometheus metrics
     */
    @Cron('* * 01 * * *')
    async updateExceptionAndImageMetrics() {
        this.loggerService.log({label: 'Running a cron job: updateExceptionAndImageMetrics'});

        const activeExceptions = await this.exceptionsService.getAllActiveExceptions();
        const activeExceptionsCount = activeExceptions ? activeExceptions.length : 0;
        this.prometheusService.activeExceptions.set(activeExceptionsCount);
        // this.loggerService.log({label: `Total number of active exceptions: ${activeExceptionsCount}`});

        const exceptionsExpireTomorrow = await this.exceptionsService.getExceptionsExpireTomorrow(M9sweeperCronJobService.getTomorrowDate());
        const exceptionsExpireTomorrowCount =exceptionsExpireTomorrow ? exceptionsExpireTomorrow.length : 0;
        this.prometheusService.expiringExceptionsTomorrow.set(exceptionsExpireTomorrowCount);
        // this.loggerService.log({label: `Total number of active exceptions expiring tomorrow: ${exceptionsExpireTomorrowCount}`});

        const totalCompliantImages = await this.imageService.getAllImagesByCompliance('Compliant');
        const totalCompliantImagesCount = +totalCompliantImages.shift().count;
        this.prometheusService.numOfCompliantImages.set(totalCompliantImagesCount);
        // this.loggerService.log({label: `Total number of compliant images: ${totalCompliantImagesCount}`});

        const totalNonCompliantImages = await this.imageService.getAllImagesByCompliance('Non-compliant');
        const totalNonCompliantImagesCount = +totalNonCompliantImages.shift().count;
        this.prometheusService.numOfNonCompliantImages.set(totalNonCompliantImagesCount);
        // this.loggerService.log({label: `Total number of non-compliant images: ${totalNonCompliantImagesCount}`});

        const totalUnScannedImages = await this.imageService.getAllImagesByCompliance(null);
        const totalUnScannedImagesCount = +totalUnScannedImages.shift().count;
        this.prometheusService.numOfUnScannedImages.set(totalUnScannedImagesCount);
        // this.loggerService.log({label: `Total number of unscanned images: ${totalUnScannedImagesCount}`});

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
