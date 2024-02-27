import { Options } from '@wdio/types';
import { config as sharedConfig } from './wdio.shared.conf.js';

export const config: Options.Testrunner = {
    ...sharedConfig,
    ...{
        // If you have trouble getting all important capabilities together, check out the
        // Sauce Labs platform configurator - a great tool to configure your capabilities:
        // https://saucelabs.com/platform/platform-configurator
        //
        capabilities: [{
            // capabilities for local browser web tests
            // browserName: 'chrome',
            // browserVersion: '122.0.6261.57',
            'goog:chromeOptions': {
                // path to the download file:
                // https://storage.googleapis.com/chrome-for-testing-public/122.0.6261.57/linux64/chrome-linux64.zip
                args: ['headless', 'disable-gpu'],
                prefs: {
                    // Download files without showing a prompt
                    'prompt_for_download': false,

                    // Configure the path for file downloads
                    'download.default_directory': `${__dirname}/downloads`,
                }
            }
        }],
    }
}
