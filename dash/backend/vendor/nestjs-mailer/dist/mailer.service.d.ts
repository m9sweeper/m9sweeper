import { SentMessageInfo } from 'nodemailer';
import { MailerOptions } from './interfaces/mailer-options.interface';
import { ISendMailOptions } from './interfaces/send-mail-options.interface';
import { MailerTransportFactory as IMailerTransportFactory } from './interfaces/mailer-transport-factory.interface';
export declare class MailerService {
    private readonly mailerOptions;
    private readonly transportFactory;
    private readonly transporter;
    private transporters;
    private initTemplateAdapter;
    constructor(mailerOptions: MailerOptions, transportFactory: IMailerTransportFactory);
    sendMail(sendMailOptions: ISendMailOptions): Promise<SentMessageInfo>;
}
