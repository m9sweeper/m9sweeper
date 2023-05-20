import config from '../../config.js';
import { login } from '../../functions/login.js';
import { logout } from '../../functions/logout.js';
import { buildUrl } from '../../functions/build-url.js';

/**
 * Verify that a user is able to login to the platform and logout of the platform. It also
 * ensures that a user with invalid credentials is not able to login.
 */
describe('Login and Logout::', () => {
    // First attempt to login with valid credentials
    it('1 Login with valid credentials', async () => {
        await login();
        expect(browser).toHaveUrl(
            buildUrl('private/dashboard/group/1'),
            {message: "m9sweeper should be displaying the default dashboard"}
        );
    });


    // Next we should logout of the UI
    it('2 Logout', async () => {
        await logout();
        expect(browser).toHaveUrl(
            buildUrl('public/login'),
            {message: "m9sweeper should be showing the login page"}
        );
    });


    // Now we make sure that we cannot login with invalid credentials
    it('3 No login with invalid credentials', async () => {
        await login(config.USERNAME, 'WRONGPASSWORD');
        expect(browser).toHaveUrl(
            buildUrl('public/login'),
            {message: "m9sweeper should be showing the login page"}
        );
    });
});