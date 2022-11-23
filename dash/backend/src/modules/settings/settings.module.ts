import {Global, Module} from '@nestjs/common';
import {SiteSettingsController} from './controllers/site-settings.controller';
import {AppSettingsService} from './services/app-settings.service';
import {AppSettingsDao} from './dao/app-settings.dao';
import LoggedInUserFactory from '../../providers/LoggedInUserFactory';
import {SiteSettingsWithoutAuthController} from "./controllers/site-settings-without-auth.controller";

@Global()
@Module({
    controllers: [
        SiteSettingsWithoutAuthController,
        SiteSettingsController,
    ],
    providers: [
        LoggedInUserFactory,
        AppSettingsService,
        AppSettingsDao,
    ],
    exports: [
        AppSettingsDao,
        AppSettingsService
    ]
})
export class SettingsModule {
}
