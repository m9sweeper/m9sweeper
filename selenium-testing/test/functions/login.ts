import config from '../config.js';
import { buildUrl } from './build-url.js';
import { sleep } from './sleep.js';

/**
 * Function to log a user in to the software.
 *
 * @param username Optional username to login with
 * @param password Optional password to login with
 */
export async function login(username = config.USERNAME, password = config.PASSWORD) {
    // Load the login page
    await browser.url(buildUrl('public/login'));

    // Enter the username and password
    await $('#email').setValue(username);
    await $('#password').setValue(password);

    // Click the login button and wait 5 seconds to wait for the page to finish loading
    await $('button[type="submit"]').customClick("login", 5000);
    await sleep(2000);
}