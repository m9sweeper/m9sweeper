"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailerService = void 0;
const tslib_1 = require("tslib");
const lodash_1 = require("lodash");
const common_1 = require("@nestjs/common");
const previewEmail = require("preview-email");
const mailer_constant_1 = require("./constants/mailer.constant");
const mailer_transport_factory_1 = require("./mailer-transport.factory");
let MailerService = class MailerService {
    constructor(mailerOptions, transportFactory) {
        this.mailerOptions = mailerOptions;
        this.transportFactory = transportFactory;
        this.transporters = new Map();
        if (!transportFactory) {
            this.transportFactory = new mailer_transport_factory_1.MailerTransportFactory(mailerOptions);
        }
        if ((!mailerOptions.transport ||
            Object.keys(mailerOptions.transport).length <= 0) &&
            !mailerOptions.transports) {
            throw new Error('Make sure to provide a nodemailer transport configuration object, connection url or a transport plugin instance.');
        }
        const templateAdapter = lodash_1.get(this.mailerOptions, 'template.adapter');
        if (this.mailerOptions.preview) {
            const defaults = { open: { wait: false } };
            this.mailerOptions.preview =
                typeof this.mailerOptions.preview === 'boolean'
                    ? defaults
                    : lodash_1.defaultsDeep(this.mailerOptions.preview, defaults);
        }
        if (mailerOptions.transports) {
            Object.keys(mailerOptions.transports).forEach((name) => {
                this.transporters.set(name, this.transportFactory.createTransport(this.mailerOptions.transports[name]));
                this.initTemplateAdapter(templateAdapter, this.transporters.get(name));
            });
        }
        if (mailerOptions.transport) {
            this.transporter = this.transportFactory.createTransport();
            this.initTemplateAdapter(templateAdapter, this.transporter);
        }
    }
    initTemplateAdapter(templateAdapter, transporter) {
        if (templateAdapter) {
            transporter.use('compile', (mail, callback) => {
                if (mail.data.html) {
                    return callback();
                }
                return templateAdapter.compile(mail, callback, this.mailerOptions);
            });
            if (this.mailerOptions.preview) {
                transporter.use('stream', (mail, callback) => {
                    return previewEmail(mail.data, this.mailerOptions.preview)
                        .then(() => callback())
                        .catch(callback);
                });
            }
        }
    }
    sendMail(sendMailOptions) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (sendMailOptions.transporterName) {
                if (this.transporters &&
                    this.transporters.get(sendMailOptions.transporterName)) {
                    return yield this.transporters
                        .get(sendMailOptions.transporterName)
                        .sendMail(sendMailOptions);
                }
                else {
                    throw new ReferenceError(`Transporters object doesn't have ${sendMailOptions.transporterName} key`);
                }
            }
            else {
                if (this.transporter) {
                    return yield this.transporter.sendMail(sendMailOptions);
                }
                else {
                    throw new ReferenceError(`Transporter object undefined`);
                }
            }
        });
    }
};
MailerService = tslib_1.__decorate([
    common_1.Injectable(),
    tslib_1.__param(0, common_1.Inject(mailer_constant_1.MAILER_OPTIONS)),
    tslib_1.__param(1, common_1.Optional()),
    tslib_1.__param(1, common_1.Inject(mailer_constant_1.MAILER_TRANSPORT_FACTORY)),
    tslib_1.__metadata("design:paramtypes", [Object, Object])
], MailerService);
exports.MailerService = MailerService;
