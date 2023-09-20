import { login } from '../../functions/login.js';
import { buildUrl } from '../../functions/build-url.js';

/**
 * Verify that the main navigation items are working and lead to the proper locations.
 */
describe('Check Navigation::', () => {
    // Login to m9sweeper and make sure we are on the default page
    it('1 Login and navigate to page', async () => {
        // Login to m9sweeper
        await login();
        expect(browser).toHaveUrl(
            buildUrl('private/dashboard/group/1'),
            {message: "m9sweeper should have logged in and loaded the default dashboard"}
        );

        // Take a screenshot at the end so that we can see the results
        // @ts-ignore
        await browser.customScreenshot("test-end");
    });


    // Verify the navigation is correct for the cluster pages using the default cluster
    it('2 Verify Cluster Navigation', async () => {
        // Load the default cluster so that we can test the cluster navigation menu
        // @ts-ignore
        await $("//mat-card-title[contains(text(),'default-cluster')]").customClick("load-default-cluster");
        expect(browser).toHaveUrl(
            buildUrl('private/clusters/1/summary'),
            {message: "m9sweeper should be displaying the cluster summary for the default cluster"}
        );

        // Navigate to the Summary page
        // @ts-ignore
        await $("//span[@class='menu-item-name'][contains(text(), 'Summary')]").customClick("summary-page");
        expect(browser).toHaveUrl(
            buildUrl('private/clusters/1/summary'),
            {message: "m9sweeper should be displaying the cluster summary page"}
        );

        // Navigate to the Cluster Info page
        // @ts-ignore
        await $("//span[@class='menu-item-name'][contains(text(), 'Cluster Info')]").customClick("info-page");
        expect(browser).toHaveUrl(
            buildUrl('private/clusters/1/info'),
            {message: "m9sweeper should be displaying the cluster info page"}
        );

        // Navigate to the Images page
        // @ts-ignore
        await $("//span[@class='menu-item-name'][contains(text(), 'Images')]").customClick("images-page");
        expect(browser).toHaveUrl(
            buildUrl('private/clusters/1/images'),
            {message: "m9sweeper should be displaying the images page"}
        );

        // Navigate to the Workloads page
        // @ts-ignore
        await $("//span[@class='menu-item-name'][contains(text(), 'Workloads')]").customClick("workloads-page");
        expect(browser).toHaveUrl(
            buildUrl('private/clusters/1/kubernetes-namespaces'),
            {message: "m9sweeper should be displaying the workloads page"}
        );

        // Navigate to the GateKeeper page
        // @ts-ignore
        await $("//span[@class='menu-item-name'][contains(text(), 'Gatekeeper')]").customClick("gatekeeper-page");
        expect(browser).toHaveUrl(
            buildUrl('private/clusters/1/gatekeeper'),
            {message: "m9sweeper should be displaying the gatekeeper page"}
        );

        // Navigate to the KubeSec page
        // @ts-ignore
        await $("//span[@class='menu-item-name'][contains(text(), 'Kubesec')]").customClick("kubesec-page");
        expect(browser).toHaveUrl(
            buildUrl('private/clusters/1/kubesec'),
            {message: "m9sweeper should be displaying the kubesec page"}
        );

        // Navigate to the kube-hunter page
        // @ts-ignore
        await $("//span[@class='menu-item-name'][contains(text(), 'kube-hunter')]").customClick("kube-hunter-page");
        expect(browser).toHaveUrl(
            buildUrl('private/clusters/1/kubehunter'),
            {message: "m9sweeper should be displaying the kube-hunter page"}
        );

        // Navigate to the kube-bench page
        // @ts-ignore
        await $("//span[@class='menu-item-name'][contains(text(), 'kube-bench')]").customClick("kube-bench-page");
        expect(browser).toHaveUrl(
            buildUrl('private/clusters/1/kubebench'),
            {message: "m9sweeper should be displaying the kube-bench page"}
        );

        // Navigate to the Falco page
        // @ts-ignore
        await $("//span[@class='menu-item-name'][contains(text(), 'Falco')]").customClick("falco-page");
        expect(browser).toHaveUrl(
            buildUrl('private/clusters/1/falco'),
            {message: "m9sweeper should be displaying the falco page"}
        );

        // Navigate to the Reports page
        // @ts-ignore
        await $("//span[@class='menu-item-name'][contains(text(), 'Reports')]").customClick("reports-page");
        expect(browser).toHaveUrl(
            buildUrl('private/clusters/1/reports'),
            {message: "m9sweeper should be displaying the reports page"}
        );

        // Take a screenshot at the end so that we can see the results
        // @ts-ignore
        await browser.customScreenshot("test-end");
    });


    // Verify the navigation is correct for the organization pages
    it('3 Verify Organization Settings Navigation', async () => {
        // Navigate to the list of cluster groups.
        // @ts-ignore
        await $("//span[@class='menu-item-name'][contains(text(), 'Home')]").customClick("m9sweeper-home");
        expect(browser).toHaveUrl(
            buildUrl('private/dashboard'),
            {message: "m9sweeper should be showing the base dashboard"}
        );

        // Navigate to the organization settings. By default, it goes to the users page.
        // @ts-ignore
        await $("//span[@class='menu-item-name'][contains(text(), 'Organization Settings')]").customClick("load-organization-settings");
        expect(browser).toHaveUrl(
            buildUrl('private/users'),
            {message: "m9sweeper should be displaying the users page"}
        );

        // Navigate to the Users page
        // @ts-ignore
        await $("//span[@class='menu-item-name'][contains(text(), 'Users')]").customClick("users-page");
        expect(browser).toHaveUrl(
            buildUrl('private/users'),
            {message: "m9sweeper should be displaying the users page"}
        );

        // Navigate to the Policies page
        // @ts-ignore
        await $("//span[@class='menu-item-name'][contains(text(), 'Policies')]").customClick("policies-page");
        expect(browser).toHaveUrl(
            buildUrl('private/policies'),
            {message: "m9sweeper should be displaying the policies page"}
        );

        // Navigate to the Exceptions page
        // @ts-ignore
        await $("//span[@class='menu-item-name'][contains(text(), 'Exceptions')]").customClick("exceptions-page");
        expect(browser).toHaveUrl(
            buildUrl('private/exceptions'),
            {message: "m9sweeper should be displaying the exceptions page"}
        );

        // Navigate to the Sign on Methods page
        // @ts-ignore
        await $("//span[@class='menu-item-name'][contains(text(), 'Sign on Methods')]").customClick("sign-on-methods-page");
        expect(browser).toHaveUrl(
            buildUrl('private/single-sign-on'),
            {message: "m9sweeper should be displaying the sign on methods page"}
        );

        // Navigate to the Docker Registries page
        // @ts-ignore
        await $("//span[@class='menu-item-name'][contains(text(), 'Docker Registries')]").customClick("docker-registries-page");
        expect(browser).toHaveUrl(
            buildUrl('private/docker-registries'),
            {message: "m9sweeper should be displaying the docker registries page"}
        );

        // Navigate to the API Key Management page
        // @ts-ignore
        await $("//span[@class='menu-item-name'][contains(text(), 'API Key Management')]").customClick("api-key-management-page");
        expect(browser).toHaveUrl(
            buildUrl('private/api-key'),
            {message: "m9sweeper should be displaying the api key management page"}
        );

        // Navigate to the Audit Logs page
        // @ts-ignore
        await $("//span[@class='menu-item-name'][contains(text(), 'Audit Logs')]").customClick("audit-logs-page");
        expect(browser).toHaveUrl(
            buildUrl('private/audit-logs'),
            {message: "m9sweeper should be displaying the audit logs page"}
        );

        // Navigate to the Falco Settings page
        // @ts-ignore
        await $("//span[@class='menu-item-name'][contains(text(), 'Falco Settings')]").customClick("falco-settings-page");
        expect(browser).toHaveUrl(
            buildUrl('private/falco'),
            {message: "m9sweeper should be displaying the falco settings page"}
        );

        // Take a screenshot at the end so that we can see the results
        // @ts-ignore
        await browser.customScreenshot("test-end");
    });
});
