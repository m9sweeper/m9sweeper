import { Injectable, ConsoleLogger, Scope } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import * as Tableify from 'tableify';

@Injectable({ scope: Scope.DEFAULT })
export class MineLoggerService extends ConsoleLogger {
  // array of messages to skip sending emails for
  private readonly messagesToIgnore = [
    'Invalid auth token',
    'Invalid auth credential',
    'Forbidden resource',
  ]

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService
  ) {
    super('MineLoggerService::Context', { timestamp: true });
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  error(message: any, trace?: any, context?: string): void {
    let errorTrace = '';
    if (typeof trace === 'string') {
      message = {
          label: message,
          data: null
      };
      errorTrace = trace;
    } else if (typeof trace === 'object' && trace instanceof Error) {
      errorTrace = trace.stack;
    }

    super.error(message, errorTrace, context);
    const messageLabel = typeof message === 'object' ? message?.label : message;

    if (
      !(this.messagesToIgnore.includes(messageLabel))  // the message isn't in the array of messages to skip sending emails for
      && this.configService.get('email.system.enableErrorReportEmail')  // and error report emails are enabled
    ) {
      const now = new Date().toUTCString();
      this.mailerService.sendMail({
        to: this.configService.get('email.system.errorReportReceiver'),
        from: this.configService.get('email.default.sender'),
        subject: `m9sweeper error: ${messageLabel}, Context: ${context}`,
        template: 'error-email',
        context: {
          root: context,
          time: now,
          message: typeof message === 'object' ? message?.label : message,
          data: Tableify(message?.data),
          stackTrace: errorTrace
        }
      }).then(errorEmailResponse => {
        this.log({label: 'Error notification email sent.', data: { mailSendResponse: errorEmailResponse }}, MineLoggerService.name);
      }).catch(e => {
        this.log({label: 'Failed to send error notification email', data: { mailSendResponse: e.message }}, MineLoggerService.name);
      });
    }
  }

}
