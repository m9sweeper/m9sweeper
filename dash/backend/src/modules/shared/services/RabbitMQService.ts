import * as amqp from 'amqp-connection-manager';
import {Injectable} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {MineLoggerService} from './mine-logger.service';

@Injectable()
export class RabbitMQService {

    private connection: any;
    private channels: Map<string, any> = new Map<string, any>();

    constructor(private readonly configurationService: ConfigService,
                private readonly mineLoggerService: MineLoggerService) {
        this.mineLoggerService.setContext(RabbitMQService.name);
        this.mineLoggerService.verbose('RabbitMQService Initializing....');
    }

    async createOrGetConnection(): Promise<void> {
        if (!this.connection) {
            if (this.configurationService.get('rabbitMQ.enabled')) {
                try {
                    this.connection = await amqp.connect(this.configurationService.get('rabbitMQ'));
                } catch (e) {
                    this.mineLoggerService.error({label: e.message, data: null}, e, RabbitMQService.name);
                    this.connection = null;
                }
            } else {
                this.mineLoggerService.log({label: 'RabbitMQ disabled', data: null}, RabbitMQService.name);
                this.connection = null;
            }
        }
    }

    async getChannel(queueName: string): Promise<any> {
        await this.createOrGetConnection();

        if (!this.connection) {
            this.mineLoggerService.error({label: 'Connection Issue', data: null}, new Error('Connection is null'), RabbitMQService.name);
            return;
        }

        if (!this.channels.has(queueName)) {
            const channelWrapper = this.connection.createChannel({
                json: true,
                setup: function(channel) {
                    return channel.assertQueue(queueName, {durable: true});
                }
            });
            this.channels.set(queueName, channelWrapper);
        }

        return this.channels.get(queueName);
    }
}
