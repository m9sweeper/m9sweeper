import {Injectable} from '@nestjs/common';
import {ISendMailOptions, MailerService} from '@nestjs-modules/mailer';
import {MineLoggerService} from './mine-logger.service';
import {ConfigService} from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly mineLoggerService: MineLoggerService,
    private readonly configService: ConfigService
  ) {}

  async send(mailData: ISendMailOptions): Promise<any> {

    this.mineLoggerService.log('Sending email....', EmailService.name);
    try {
      if (this.configService.get('email.smtp.debug')) {
        this.mineLoggerService.log({
          label: 'Skipping sending email - email not configured',
          data: mailData
        });
      }

      if (this.configService.get('email.smtp.host')) {
        await this.mailerService.sendMail(mailData); // send async

        return Date.now();
      }
    } catch (e) {
      // ope this is a problem. we could end up with an infinite loop:
      // the email service fails, which logs an error, which tries to send an email, which fails, which logs an error, which tries to send an email...
      this.mineLoggerService.error({label: e.message, data: null}, e, EmailService.name);

      return null;
    }


  }
}
