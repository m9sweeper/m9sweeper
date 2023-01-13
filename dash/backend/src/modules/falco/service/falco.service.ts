import {Injectable} from '@nestjs/common';
import {FalcoDto} from '../dto/falco.dto';
import {FalcoDao} from '../dao/falco.dao';
import {createHash} from 'crypto';
import {FalcoWebhookInputDto} from '../dto/falco-webhook-input.dto';
import {instanceToPlain} from 'class-transformer';
import {addDays, format, set, sub} from 'date-fns';
import {CsvService} from "../../shared/services/csv.service";
import {FalcoCsvDto} from "../dto/falco-csv-dto";
import {FalcoCountDto} from "../dto/falco-count.dto";
import {FalcoSettingDto} from "../dto/falco-setting.dto";

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
        signature?: string,
        eventId?: number
    ): Promise<{  logCount: number, list: FalcoDto[] }> {

       return this.falcoDao.getFalcoLogs(clusterId, limit, page, priorities, orderBy, startDate, endDate, namespace, pod, image, signature, eventId);

    }

    async getFalcoLogByEventId(
        eventId: number
    ): Promise<FalcoDto > {
        return this.falcoDao.getFalcoLogByEventId(eventId);
    }

    async getCountOfFalcoLogsBySignature(
        clusterId: number, signature: string
    ): Promise<FalcoCountDto[]> {
        // set default as 0 if date has no return results

        const currentDate = set(new Date(), {hours: 0, minutes: 0, seconds: 0, milliseconds: 0});
        const endDate = currentDate;
        const startDate = sub(currentDate, {days: 28});
        let newDate =sub(currentDate, {days: 28});

        const resultSet = await this.falcoDao.getCountOfFalcoLogsBySignature(clusterId, signature);

        let value = 0;
        const newResultSet = [];

        for (let i = 0; i <=28; i++) {
            resultSet.filter(result => newDate.toString() === result.date.toString()).forEach(result => value = result.count);

            let newResult = new FalcoCountDto();
            newResult.date = newDate;
            newResult.count = value;

            newDate = addDays(newDate,1);

            newResultSet.push(newResult);
            value =0;
        }

        return newResultSet;
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

    async createFalcoLog(clusterId: number, falcoWebhookLog: FalcoWebhookInputDto): Promise<FalcoDto> {
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

    async createFalcoSetting(clusterId: number, falcoSetting: FalcoSettingDto): Promise <any>{
        return this.falcoDao.createFalcoSetting(clusterId, falcoSetting);
    }

    async sendFalcoEmail(clusterId: number, newFalcoLog: Promise <FalcoDto>){
        return this.falcoDao.sendFalcoEmail(clusterId, newFalcoLog);
    }
}
