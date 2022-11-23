import {Injectable} from '@nestjs/common';
import {ResetPasswordDao} from '../dao/reset-password.dao';
import {UserProfileDto} from '../../user/dto/user-profile-dto';
import {ResetPasswordModel} from '../models/reset-password.model';
import {EmailService} from '../../shared/services/email.service';
import {instanceToPlain} from 'class-transformer';
import {SentMessageInfo} from 'nodemailer';
import {AppSettingsService} from '../../settings/services/app-settings.service';
import {AppSettingsDto} from '../../settings/dto/app-settings-dto';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import {AppSettingsType, SiteSettingsType} from "../../settings/enums/settings-enums";

@Injectable()
export class ResetPasswordService {

    constructor(private readonly resetPasswordDao: ResetPasswordDao,
                private readonly email: EmailService,
                private readonly appSettingsService: AppSettingsService,
                private readonly configService: ConfigService) {}

    async changeUserAccountPassword(password: string, userId: number): Promise<boolean> {
        const hashPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));
        const passwordChangeResult = await this.resetPasswordDao.changePassword(userId, hashPassword);
        return passwordChangeResult > 0;
    }

    async doReset(token: string, userId: number, password: string): Promise<boolean> {
        const resetPasswordData: ResetPasswordModel = await this.resetPasswordDao.loadTokenData(userId, token);
        if (resetPasswordData?.expiredAt >= Date.now()) {
            await this.changeUserAccountPassword(password, userId);
            resetPasswordData.isUsed = true;
            await this.resetPasswordDao.saveResetToken(resetPasswordData);

            return true;
        }
        return false;
    }

    async save(userProfileDto: UserProfileDto, event: string) {
        const now = Date.now();
        const resetPasswordModel = new ResetPasswordModel();
        resetPasswordModel.userId = userProfileDto.id;
        resetPasswordModel.token = this.generateToken(10);
        resetPasswordModel.generatedAt = now;
        resetPasswordModel.expiredAt = now + (2 * 60 * 60 * 1000);
        resetPasswordModel.isUsed = false;

        await this.resetPasswordDao.saveResetToken(resetPasswordModel);

        if (event === 'CREATE_PASSWORD') {
            await this.sendPasswordCreateEmail(userProfileDto, resetPasswordModel.token);
        } else if (event === 'RESET_PASSWORD') {
            await this.sendPasswordResetEmail(userProfileDto, resetPasswordModel.token);
        }
    }

    private async sendPasswordCreateEmail(userProfileDto: UserProfileDto, token: string) {
        const base64Token = Buffer.from(JSON.stringify({
            userId: userProfileDto.id,
            token
        })).toString('base64');
        const siteSettings = <AppSettingsDto> await this.appSettingsService.getSettings(AppSettingsType.SITE_SETTINGS, SiteSettingsType.SITE_NAME);
        await this.email.send({
            to: userProfileDto.email,
            from: this.configService.get('email.default.sender'),
            subject: `Activate your M9Sweeper account`,
            template: 'welcome-email',
            context: {
                userProfile: instanceToPlain(userProfileDto),
                resetPasswordLink: `${this.configService.get('server.frontendUrl')}/public/account-activation/${encodeURIComponent(base64Token)}`
            }
        });
    }

    private async sendPasswordResetEmail(userProfileDto: UserProfileDto, token: string) {
        const base64Token = Buffer.from(JSON.stringify({
            userId: userProfileDto.id,
            token
        })).toString('base64');

        const siteName = (await (this.appSettingsService.getSettings(AppSettingsType.SITE_SETTINGS, SiteSettingsType.SITE_NAME)) as AppSettingsDto)?.value
        const emailSendResponse: SentMessageInfo = await this.email.send({
            to: userProfileDto.email,
            from: this.configService.get('email.default.sender'),
            subject: `Reset password request for your ${siteName ?? 'M9sweeper'} account`,
            template: 'reset-password-email',
            context: {
                companyName: siteName ?? 'M9sweeper',
                userProfile: instanceToPlain(userProfileDto),
                resetPasswordLink: `${this.configService.get('server.frontendUrl')}/public/reset-password/${encodeURIComponent(base64Token)}`
            }
        });
    }

    private generateToken(length) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for ( let i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
}
