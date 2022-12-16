import {Injectable} from '@nestjs/common';
import {FalcoDto} from '../dto/falco.dto';
import {FalcoDao} from '../dao/falco.dao';
import {createHash} from 'crypto';
import {FalcoWebhookInputDto} from '../dto/falco-webhook-input.dto';
import {instanceToPlain} from 'class-transformer';
import {format} from 'date-fns';
import {CsvService} from "../../shared/services/csv.service";
import {FalcoCsvDto} from "../dto/falco-csv-dto";

@Injectable()
export class FalcoService {
    constructor(
        private readonly falcoDao: FalcoDao,
        private readonly csvService: CsvService
    ) {}

    async getFalcoLogs(
        clusterId: number,
        limit = 20,
        page = 0,
        priorities?: string [],
        orderBy?: string,
        startDate?: string,
        endDate?: string,
        namespace?: string,
        pod?: string,
        image?: string,
        signature?: string
    ): Promise<{  logCount: number, list: FalcoDto[] }> {

       return this.falcoDao.getFalcoLogs(clusterId, limit, page, priorities, orderBy, startDate, endDate, namespace, pod, image, signature);

    }

    async getFalcoCsv( clusterId: number): Promise<FalcoCsvDto> {
        const queryResponse = await this.falcoDao.getFalcoLogsForExport(clusterId);
        const result = [this.csvService.buildLine(['Date', 'Namespace', 'Pod',
            'Image', 'Priority', 'Message'])];

        for (let i = 0; i < queryResponse.logCount; i++) {
            const falcoCol = queryResponse.fullList[i];
            result.push(this.csvService.buildLine([
                String(falcoCol.calendarDate),
                String(falcoCol.namespace),
                String(falcoCol.container),
                String(falcoCol.image),
                String(falcoCol.level),
                String(falcoCol.message),
            ]));
        }

        return {
            filename: `Falco-Logs${format(new Date(), 'yyyy-MM-dd-hh-mm-ss')}.csv`,
            csv: result.join('\n')
        }
    }

    async createFalcoLog(clusterId: number, falcoWebhookLog: FalcoWebhookInputDto): Promise<number> {
        const falcoLog = new FalcoDto;
        falcoLog.clusterId = clusterId;
        falcoLog.rule = falcoWebhookLog.rule;
        falcoLog.namespace = falcoWebhookLog.outputFields.k8sNamespaceName;
        falcoLog.image = falcoWebhookLog.outputFields.containerImageRepository;
        falcoLog.container = falcoWebhookLog.outputFields.k8sPodName;
        falcoLog.level = falcoWebhookLog.priority;
        falcoLog.message = falcoWebhookLog.output;
        falcoLog.raw = instanceToPlain(falcoWebhookLog);
        // If falco provides a timestamp for the event, save that. Otherwise, the database will
        // default to the current time when the log is added
        if (falcoWebhookLog.outputFields.eventTime) {
            // By default falco returns timestamps in nanoseconds, and needs to be converted to milliseconds for DB storage
            falcoLog.timestamp = Math.round(falcoWebhookLog.outputFields.eventTime / 1000000);
            falcoLog.calendarDate = format(new Date(falcoLog.timestamp), 'yyyy-MM-dd');
        }
        const signature = [falcoLog.clusterId, falcoLog.rule, falcoLog.namespace, falcoLog.image].join('|');
        const globalSignature = [falcoLog.rule, falcoLog.image].join('|');
        falcoLog.anomalySignature = createHash('md5')
            .update(signature)
            .digest('hex');
        falcoLog.anomalySignatureGlobal = createHash('md5')
            .update(globalSignature)
            .digest('hex');
        return this.falcoDao.createFalcoLog(falcoLog);
    }
}
