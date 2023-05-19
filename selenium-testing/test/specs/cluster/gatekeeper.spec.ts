import { login } from '../../functions/login.js';
import { buildUrl } from '../../functions/build-url.js';
import { sleep } from '../../functions/sleep.js';
import { exec } from '../../functions/exec.js';
import config from '../../config.js';

/**
 * Ensure that the gatekeeper page is function and that gatekeeper installs properly
 */
describe('Gatekeeper Page::', () => {
    // Login to m9sweeper and navigate to the images page
    it('1 Login and navigate to page', async () => {
        // Login to m9sweeper
        await login();
        expect(browser).toHaveUrl(buildUrl('private/dashboard/group/1'));

        // Open the default cluster
        await $("//mat-card/div/span[contains(text(),'default-cluster')]").customClick("load-default-cluster");
        expect(browser).toHaveUrl(buildUrl('private/clusters/1/summary'));

        // Move to the gatekeeper page
        await $("//mat-list/a[@title='GateKeeper']").customClick("gatekeeper-page");
        expect(browser).toHaveUrl(buildUrl('private/clusters/1/gatekeeper'));
    });


    // Use helm to install GateKeeper
    it('2 Install GateKeeper with Helm', async () => {
        // Make sure gatekeeper is not yet installed
        expect(await $("//mat-card-content//h1[contains(normalize-space(), 'Not Installed')]")).toBePresent();

        // Take a screenshot for records
        await browser.customScreenshot("pre-installation");

        // Wait for 5 seconds to ensure log output is clear for the commands
        await sleep(5000);

        // Install the gatekeeper helm repo
        await exec("helm", "repo", "add", "gatekeeper", "https://open-policy-agent.github.io/gatekeeper/charts");

        // Run the helm repo update command
        await exec("helm", "repo", "update")

        // Run the helm install command to install gatekeeper
        await exec("helm", "upgrade", "--install", "gatekeeper", "gatekeeper/gatekeeper",
            "--wait", "--timeout", "10m",
            "--namespace", "gatekeeper-system", "--create-namespace",
            "--version", config.GATEKEEPER_VERSION);

        // Wait 30 seconds to give time for gatekeeper to be registered in m9sweeper
        console.log("Sleeping for 30 seconds to allow m9seeper to detect gatekeeper");
        await sleep(30000);

        // Reload the page we are currently on so we can get an updated gatekeeper status
        await browser.refresh();

        // Wait 5 seconds to let the page finish loading after the refresh
        await sleep(5000);

        // Make sure Gatekeeper is showing as installed but not yet setup
        expect(await $("//mat-card-content//h1[contains(normalize-space(), 'Not Setup')]")).toBePresent();

        // Take a screenshot for records
        await browser.customScreenshot("post-installation");
    });


    // Setup Gatekeeper in m9sweeper
    it('3 Setup Gatekeeper', async () => {
        // Locate the setup button and click it
        await $("//span[contains(text(), 'Setup')]").customClick("setup");

        // Expand the general dropdown menu in the contraint library
        await $("//div[contains(@class, 'cdk-overlay-container')]//span[contains(text(), 'general')]").customClick("expand-general");

        // Enable the containerlimits contraint template
        await $("//div[contains(@class, 'cdk-overlay-container')]//span[contains(text(), 'containerlimits')]").customClick("enable-containerlimits");

        // Click the Save Changes button to stave the gatekeeper setting to m9sweeper
        await $("//div[contains(@class, 'cdk-overlay-container')]//span[contains(text(), 'Save Changes')]").customClick("save-changes");

        // Wait for the alert stating the template was deployed successfully
        await $("//ff-alerts//div[contains(@class, 'content') and contains(normalize-space(), 'Templates were deployed successfully')]")
            .waitForDisplayed({timeout: 60000, interval: 1000, timeoutMsg: "Templates were deployed successfully alert did not appear, this suggests the constraint template was not created sucessfully."});

        // Verify the status text is now showing Gatekeeper as setup
        expect(await $("//mat-card-content//h1[contains(normalize-space(), 'Setup')]")).toBePresent();
    });


    // Setup the constraint template
    it('4 Setup Constraint Template', async () => {
        // Verify that the constraint template exists
        const templateListItem = await $("//table//td[contains(normalize-space(), 'k8scontainerlimits')]");
        expect(await templateListItem).toBePresent;

        // Click on the constraint template to open the constraint template editing page
        await templateListItem.customClick("open-edit-page");

        // Verify that the constraint template has not been configured yet
        expect(await $("//mat-card-content//h1[contains(normalize-space(), 'Not Setup')]")).toBePresent();

        // Locate and click on the Add More button
        await $("//span[contains(text(), 'Add More')]").customClick("add-more");

        // Locate and fill out the Name input
        const nameInputField = await $("//div[contains(@class, 'cdk-overlay-container')]//input[@formcontrolname='name']");
        expect(await nameInputField).toExist();
        nameInputField.clearValue();
        nameInputField.setValue("testing-limit");

        // Locate and fill out the description input
        const descriptionInputField = await $("//div[contains(@class, 'cdk-overlay-container')]//input[@formcontrolname='description']");
        expect(await descriptionInputField).toExist();
        descriptionInputField.clearValue();
        descriptionInputField.setValue("Limit created by automated testing");

        // Locate and fill out the cpu properties input
        const cpuInputField = await $("//div[contains(@class, 'cdk-overlay-container')]//input[@name='cpu']");
        expect(await cpuInputField).toExist();
        cpuInputField.clearValue();
        cpuInputField.setValue("2000m");

        // Locate and fill out the memory properties input
        const memoryInputField = await $("//div[contains(@class, 'cdk-overlay-container')]//input[@name='memory']");
        expect(await memoryInputField).toExist();
        memoryInputField.clearValue();
        memoryInputField.setValue("2Gi");

        // Locate and click the Save Changes button
        await $("//div[contains(@class, 'cdk-overlay-container')]//span[contains(text(), 'Save Changes')]").customClick("save-changes")

        // Wait for the alert stating the constraint was created successfully
        await $("//ff-alerts//div[contains(@class, 'content') and contains(normalize-space(), 'Constraint created successfully')]")
            .waitForDisplayed({timeout: 60000, interval: 1000, timeoutMsg: "Constraint created successfully alert did not appear, this suggests the constraint was not created sucessfully."});

        // Verify the status text is now showing Gatekeeper as setup
        expect(await $("//mat-card-content//h1[contains(normalize-space(), 'Setup')]")).toBePresent();
    });
});