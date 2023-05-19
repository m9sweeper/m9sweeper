import { login } from '../../functions/login.js';
import { buildUrl } from '../../functions/build-url.js';

/**
 * Verify that the main navigation items are working and lead to the proper locations.
 */
describe('Check Navigation::', () => {
    // Login to m9sweeper and make sure we are on the default page
    it('1 Login and navigate to page', async () => {
        await login();
        expect(browser).toHaveUrl(buildUrl('private/dashboard/group/1'));
    });


    // Verify the navigation is correct for the cluster pages using the default cluster
    it('2 Verify Cluster Navigation', async () => {
        // Load the default cluster so we can test the cluster navigatione menu
        await $("//mat-card/div/span[contains(text(),'default-cluster')]").customClick("load-default-cluster");
        expect(browser).toHaveUrl(buildUrl('private/clusters/1/summary'));

        // Navigate to the Summary page
        await $("//mat-list/a[@title='Summary']").customClick("summary-page");
        expect(browser).toHaveUrl(buildUrl('private/clusters/1/summary'));

        // Navigate to the Cluster Info page
        await $("//mat-list/a[@title='Cluster Info']").customClick("info-page");
        expect(browser).toHaveUrl(buildUrl('private/clusters/1/info'));

        // Navigate to the Images page
        await $("//mat-list/a[@title='Images']").customClick("images-page");
        expect(browser).toHaveUrl(buildUrl('private/clusters/1/images'));

        // Navigate to the Workloads page
        await $("//mat-list/a[@title='Workloads']").customClick("workloads-page");
        expect(browser).toHaveUrl(buildUrl('private/clusters/1/kubernetes-namespaces'));

        // Navigate to the GateKeeper page
        await $("//mat-list/a[@title='GateKeeper']").customClick("gatekeeper-page");
        expect(browser).toHaveUrl(buildUrl('private/clusters/1/gatekeeper'));

        // Navigate to the KubeSec page
        await $("//mat-list/a[@title='KubeSec']").customClick("kubesec-page");
        expect(browser).toHaveUrl(buildUrl('private/clusters/1/kubesec'));

        // Navigate to the Kube Hunter page
        await $("//mat-list/a[@title='Kube Hunter']").customClick("kube-hunter-page");
        expect(browser).toHaveUrl(buildUrl('private/clusters/1/kubehunter'));

        // Navigate to the Kube Bench page
        await $("//mat-list/a[@title='Kube Bench']").customClick("kube-bench-page");
        expect(browser).toHaveUrl(buildUrl('private/clusters/1/kubebench'));

        // Navigate to the Falco page
        await $("//mat-list/a[@title='Falco']").customClick("falco-page");
        expect(browser).toHaveUrl(buildUrl('private/clusters/1/falco'));

        // Navigate to the Reports page
        await $("//mat-list/a[@title='Reports']").customClick("reports-page");
        expect(browser).toHaveUrl(buildUrl('private/clusters/1/reports'));
    });


    // Verify the navigation is correct for the orginization pages
    it('3 Verify Orginization Settings Navigation', async () => {
        // Navigate to the orginization settings. By default it goes to the users page.
        await $("//mat-list/div/a[@title='Organization Settings']").customClick("load-organization-settings");
        expect(browser).toHaveUrl(buildUrl('private/users'));

        // Navigate to the Orginization page
        await $("//mat-list/a[@title='Organization']").customClick("organization-page");
        expect(browser).toHaveUrl(buildUrl('private/settings'));

        // Navigate to the Users page
        await $("//mat-list/a[@title='Users']").customClick("users-page");
        expect(browser).toHaveUrl(buildUrl('private/users'));

        // Navigate to the Licenses page
        await $("//mat-list/a[@title='License']").customClick("licenses-page");
        expect(browser).toHaveUrl(buildUrl('private/licenses'));

        // Navigate to the Policies page
        await $("//mat-list/a[@title='Policies']").customClick("policies-page");
        expect(browser).toHaveUrl(buildUrl('private/policies'));

        // Navigate to the Exceptions page
        await $("//mat-list/a[@title='Exceptions']").customClick("exceptions-page");
        expect(browser).toHaveUrl(buildUrl('private/exceptions'));

        // Navigate to the Sign on Methods page
        await $("//mat-list/a[@title='Sign On Methods']").customClick("sign-on-methods-page");
        expect(browser).toHaveUrl(buildUrl('private/single-sign-on'));

        // Navigate to the Docker Registries page
        await $("//mat-list/a[@title='Docker Registries']").customClick("docker-registries-page");
        expect(browser).toHaveUrl(buildUrl('private/docker-registries'));

        // Navigate to the API Key Management page
        await $("//mat-list/a[@title='API Key Management']").customClick("api-key-management-page");
        expect(browser).toHaveUrl(buildUrl('private/apii-key'));

        // Navigate to the Audit Logs page
        await $("//mat-list/a[@title='Audit Logs']").customClick("audit-logs-page");
        expect(browser).toHaveUrl(buildUrl('private/audit-logs'));
    });
});