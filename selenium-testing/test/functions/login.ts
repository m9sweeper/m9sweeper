import config from '../config.js';
import { buildUrl } from './build-url.js';

/**
 * Function to log a user in to the software.
 *
 * @param username Optional username to log in with
 * @param password Optional password to log in with
 * @param skipLoggedInCheck Optional - skip the check making sure that the login was successful
 */
export async function login(username = config.USERNAME, password = config.PASSWORD, skipLoggedInCheck = false) {
    // Load the login page
    await browser.url(buildUrl('public/login'));

    // Wait for the login dialog to be visible
    await (await $("//div[contains(@class, 'login-form-card')]")).waitForExist(
        {
            timeout: 10000,
            interval: 1000,
            timeoutMsg: 'The login dialog should exist'
        }
    );

    // Locate the email input field and enter the email address
    const emailInput = await $("//label[contains(normalize-space(), 'Email')]/parent::div//input[@type='email']");
    expect(emailInput).toBePresent(
        {message: 'Email input field should be present'}
    );
    await emailInput.setValue(username);

    // Locate the password input field and enter the password
    const passwordInput = await $("//label[contains(normalize-space(), 'Password')]/parent::div//input[@type='password']");
    expect(passwordInput).toBePresent(
        {message: 'Password input field should be present'}
    );
    await passwordInput.setValue(password);

    // Click the login button and wait for the default cluster listing to appear so that we know the page has loaded.
    // Do not run this if the option to skip this check is true
    if (!skipLoggedInCheck) {
        // @ts-ignore
        await $('button[type="submit"]').customClick("login", 1000);
        await $("//mat-card-title[contains(text(),'default-cluster')]").waitForExist(
            {
                timeout: 10000,
                interval: 1000,
                timeoutMsg: 'm9sweeper should have logged and and should be displaying the default dashboard'
            }
        );
    }
}