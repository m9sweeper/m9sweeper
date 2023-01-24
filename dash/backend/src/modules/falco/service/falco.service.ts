import {Injectable, LoggerService} from '@nestjs/common';
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
import {EmailService} from "../../shared/services/email.service";
import {ConfigService} from "@nestjs/config";
import {MineLoggerService} from "../../shared/services/mine-logger.service";

@Injectable()
export class FalcoService {
    constructor(
        private readonly falcoDao: FalcoDao,
        private readonly csvService: CsvService,
        private readonly email: EmailService,
        private readonly configService: ConfigService,
        private readonly loggerService: MineLoggerService,
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
        const createdLog = await this.falcoDao.createFalcoLog(falcoLog);

        // look up falco settings in order to decide if we need to send email(s) to administrators
        await this.sendFalcoEmailAlert(clusterId, createdLog);

        return createdLog;
    }

    async createFalcoSetting(clusterId: number, falcoSetting: FalcoSettingDto): Promise <any>{
        return this.falcoDao.createFalcoSetting(clusterId, falcoSetting);
    }

    async findFalcoSettingByClusterId(clusterId: number): Promise<FalcoSettingDto>{
        return this.falcoDao.findFalcoSettingByClusterId(clusterId);
    }

    async getAllAdminsToMail(): Promise<any>{
        return this.falcoDao.getAllAdminsToMail();
    }

    async sendFalcoEmail(emailReceiver: string, clusterId: number, falcoId: number, falcoSeverity: string, falcoNamespace: string, falcoSignature: string, newFalcoLog: FalcoDto): Promise<any>{
        const emailSentTime = this.email.send({
            to: `${emailReceiver}`,
            from: this.configService.get('email.default.sender'),
            subject: `New ${falcoSeverity} Project Falco Alert in ${falcoNamespace}`,
            template: 'falco-log-email',
            context: {
                falcoLog: instanceToPlain(newFalcoLog),
                falcoLogTags: instanceToPlain(newFalcoLog.raw["tags"]),
                moreDetailsLink: `https://dev-m9sweeper.intelletive.com/private/clusters/${clusterId}/falco/more/${falcoId}/signature/${falcoSignature}`,
            }
        }).catch(e => {
            this.loggerService.log('Error sending falco email: ' + e);
        });
        return emailSentTime;
    }

    async addFalcoEmail(emailSentTime: number, clusterId: number, falcoSignature: string): Promise<any>{
        return this.falcoDao.addFalcoEmail(emailSentTime, clusterId, falcoSignature);
    }

    async falcoEmailAlreadySent(clusterId: number, falcoSignature: string): Promise<any>{
        return this.falcoDao.falcoEmailAlreadySent( clusterId, falcoSignature);
    }

    async sendFalcoEmailAlert(clusterId: number, newFalcoLog: FalcoDto) {
        const falcoSetting = await this.findFalcoSettingByClusterId(clusterId);

        if (!falcoSetting) {
            return; // no settings means there's no email to send!
        }

        // get all admin email addresses
        const allAdminEmail = await this.getAllAdminsToMail();
        // To test email: const allAdminEmailArray = ['some_email_address'] and comment out forEach();
        const allAdminEmailArray = [];
        allAdminEmail.forEach( element => allAdminEmailArray.push(element.email));

        // Parse data from new falco log fields
        const falcoId = newFalcoLog.id;
        const falcoSignature = newFalcoLog.anomalySignature;
        const falcoNamespace = newFalcoLog.namespace;
        const falcoSeverity = newFalcoLog.level;

        // Parse data from falco settings json fields
        const severityLevel = falcoSetting.severityLevel;
        const anomalyAlertFrequencyAsMilliseconds = (falcoSetting.anomalyFrequency * 24 * 60 * 60 * 1000);
        const weekDay = falcoSetting.weekday;
        const emailList = falcoSetting.emailList.split(',');
        const cleanEmailList = emailList.map(e => e.trim()).filter(e => e !== '');
        const whoToNotify = falcoSetting.whoToNotify;

        if (!severityLevel.includes(falcoSeverity)) {
            return; // no need to send email - does not match the severity level we send emails for
        }

        // Have we already sent an email ?
        const lastEmailSentTime = await this.falcoEmailAlreadySent(clusterId, falcoSignature);

        // if no email record then send an email now
        if (lastEmailSentTime === null || lastEmailSentTime <= (Date.now() - anomalyAlertFrequencyAsMilliseconds)) {
            await this.sendFalcoEmailAndAddFalcoEmailRecord(whoToNotify, allAdminEmailArray, cleanEmailList, clusterId, falcoId, falcoSeverity, falcoNamespace, falcoSignature, newFalcoLog);
        } else {
            this.loggerService.log('Email notification was already sent for this anomaly!');
        }
    }

    async sendFalcoEmailAndAddFalcoEmailRecord(whoToNotify, allAdminEmailArray: any[], emailList, clusterId: number, falcoId, falcoSeverity, falcoNamespace, falcoSignature, newFalcoLog: FalcoDto) {
        // send to all admin OR specific email list?
        const usersToSendTo = (whoToNotify === 'allAdmin') ? allAdminEmailArray : emailList;

        for (const user of usersToSendTo) {
            const emailSentTime = await this.sendFalcoEmail(
                user,
                clusterId,
                falcoId,
                falcoSeverity,
                falcoNamespace,
                falcoSignature,
                newFalcoLog
            );

            // if email is sent then add a falco email record
            if (emailSentTime !== null && emailSentTime !== undefined) {
                await this.addFalcoEmail(emailSentTime, clusterId, falcoSignature);
            } else {
                this.loggerService.log("Failed to send email!");
            }
        }
    }

}
