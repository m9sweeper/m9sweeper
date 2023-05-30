import { login } from '../../functions/login.js';
import { buildUrl } from '../../functions/build-url.js';
import { sleep } from '../../functions/sleep.js';
import { exec } from '../../functions/exec.js';
import config from '../../config.js';

/**
 * Ensure that the gatekeeper page is functional and that gatekeeper installs properly
 */
describe('Gatekeeper Page::', () => {

    // Skip running these tests if the SKTIP_GATEKEEPER_TESTS setting was set to true
    if (config.SKIP_GATEKEEPER_TESTS) {
        pending("Skipping Gatekeeper tests due to configured SKIP_GATEKEEPER_TESTS");
    }

    // Login to m9sweeper and navigate to the gatekeeper page
    it('1 Login and navigate to page', async () => {
        // Login to m9sweeper
        await login();
        expect(browser).toHaveUrl(
            buildUrl('private/dashboard/group/1'),
            {message: "m9sweeper should have logged in and loaded the default dashboard"}
        );

        // Open the default cluster
        await $("//mat-card/div/span[contains(text(),'default-cluster')]").customClick("load-default-cluster");
        expect(browser).toHaveUrl(
            buildUrl('private/clusters/1/summary'),
            {message: "m9sweeper should be displaying the cluster summary for the default cluster"}
        );

        // Move to the Gatekeeper page
        await $("//mat-list/a[@title='GateKeeper']").customClick("gatekeeper-page");
        expect(browser).toHaveUrl(
            buildUrl('private/clusters/1/gatekeeper'),
            {message: "m9sweeper should be displaying the GateKeeper page"}
        );

        // Take a screenshot at the end so we can see the results
        await browser.customScreenshot("test-end");
    });


    // Use helm to install GateKeeper
    it('2 Install GateKeeper with Helm', async () => {
        // Get the gatekeeper status field so we can tell if its is installed or not. We do not need to run
        // this test if it is already installed. This likely can happen if running tests locally.
        const statusText = await (await $("//mat-card-content//h1")).getText();

        // If gatekeeper is installed then we should skip this test
        if (statusText !== "Not Installed") {
            pending("Gatekeeper is already installed")
        }

        // Make sure gatekeeper is not yet installed
        expect(await $("//mat-card-content//h1[contains(normalize-space(), 'Not Installed')]")).toBePresent(
            {message: "m9sweeper should be showing Gatekeeper as Not Installed"}
        );

        // Take a screenshot for records
        await browser.customScreenshot("pre-installation");

        // Wait for 5 seconds to ensure log output is clear for the commands
        await sleep(5000);

        // Install the gatekeeper helm repo
        let exitCode = await exec("helm repo add gatekeeper https://open-policy-agent.github.io/gatekeeper/charts");
        expect(exitCode).toEqual(0);

        // Run the helm repo update command
        exitCode = await exec("helm repo update");
        expect(exitCode).toEqual(0);

        // Build the default helm install command for gatekeeper
        let installCommand = "helm upgrade --install gatekeeper gatekeeper/gatekeeper --namespace gatekeeper-system --create-namespace " +
            `--version ${config.GATEKEEPER_VERSION} --wait --timeout 10m`;

        // Ad the custom docker registry URL if one is supplied via environment variables
        if ((config.DOCKER_REGISTRY?.trim()?.length || 0) > 0) {
            installCommand = installCommand + ` --set-string image.repository='${config.DOCKER_REGISTRY}/openpolicyagent/gatekeeper' ` +
                `--set-string image.crdRepository='${config.DOCKER_REGISTRY}/openpolicyagent/gatekeeper-crds' ` +
                `--set-string postUpgrade.labelNamespace.image.repository='${config.DOCKER_REGISTRY}/openpolicyagent/gatekeeper-crds' ` +
                `--set-string postInstall.labelNamespace.image.repository='${config.DOCKER_REGISTRY}/openpolicyagent/gatekeeper-crds' ` +
                `--set-string postInstall.probeWebhook.image.repository='${config.DOCKER_REGISTRY}/curlimages/curl' ` +
                `--set-string preUninstall.deleteWebhookConfigurations.image.repository='${config.DOCKER_REGISTRY}/openpolicyagent/gatekeeper-crds'`;
        }

        // Run the helm install command to install gatekeeper
        exitCode = await exec(`${installCommand} --debug`);
        expect(exitCode).toEqual(0);

        // Wait 30 seconds to give time for gatekeeper to be registered in m9sweeper
        console.log("Sleeping for 30 seconds to allow m9seeper to detect gatekeeper");
        await sleep(30000);

        // Reload the page we are currently on so we can get an updated gatekeeper status
        await browser.refresh();

        // Wait 5 seconds to let the page finish loading after the refresh
        await sleep(5000);

        // Make sure Gatekeeper is showing as installed but not yet setup
        expect(await $("//mat-card-content//h1[contains(normalize-space(), 'Not Setup')]")).toBePresent(
            {message: "m9sweeper should be showing GateKeeper as installed, but in the Not Setup status"}
        );

        // Take a screenshot at the end so we can see the results
        await browser.customScreenshot("test-end");
    });


    // Setup Gatekeeper in m9sweeper
    it('3 Setup Gatekeeper', async () => {
        // Get the gatekeeper status field so we can tell if its is setup or not. We do not need to run
        // this test if it is already setup. This likely can happen if running tests locally.
        const statusText = await (await $("//mat-card-content//h1")).getText();

        // If gatekeeper is already setup then we should skip this test
        if (statusText !== "Not Setup") {
            pending("Gatekeeper is already setup")
        }

        // Locate the setup button and click it
        await $("//span[contains(text(), 'Setup')]").customClick("setup");
        expect(await $("//div[contains(@class, 'cdk-overlay-container')]//app-add-constraint-dialog")).toBePresent(
            {message: "The dialog for adding a constraint template should be visable"}
        );

        // Expand the general dropdown menu in the contraint library
        await $("//div[contains(@class, 'cdk-overlay-container')]//span[contains(text(), 'general')]").customClick("expand-general");
        expect(await $("//div[contains(@class, 'cdk-overlay-container')]//span[contains(text(), 'general')]/following-sibling::mat-icon[contains(normalize-space(), 'expand_more')]"))
            .toHaveElementClassContaining(
                "rotated",
                {message: "The general section should be expanded to view the constriant templates within"}
            );

        // Enable the containerlimits contraint template
        await $("//div[contains(@class, 'cdk-overlay-container')]//mat-checkbox[@id='containerlimits']").customClick("enable-containerlimits");
        expect(await $("//div[contains(@class, 'cdk-overlay-container')]//mat-checkbox[@id='containerlimits']")).toHaveElementClassContaining(
            "mat-checkbox-checked",
            {message: "The containerlimits contraint template should be selected"}
        );

        // Click the Save Changes button to stave the gatekeeper setting to m9sweeper
        await $("//div[contains(@class, 'cdk-overlay-container')]//span[contains(text(), 'Save Changes')]").customClick("save-changes");
        expect(await $("//div[contains(@class, 'cdk-overlay-container')]//app-add-constraint-dialog")).not.toBePresent(
            {message: "The dialog for adding a constraint template should no longer be visable"}
        );

        // Wait for the alert stating the template was deployed successfully
        await $("//ff-alerts//div[contains(@class, 'content') and contains(normalize-space(), 'Templates were deployed successfully')]")
            .waitForDisplayed({timeout: 60000, interval: 1000, timeoutMsg: "Templates were deployed successfully alert did not appear, this suggests the constraint template was not created sucessfully."});

        // Verify the status text is now showing Gatekeeper as setup
        expect(await $("//mat-card-content//h1[contains(normalize-space(), 'Setup')]")).toBePresent(
            {message: "m9sweeper should be reporting gatekeeper as Setup"}
        );

        // Take a screenshot at the end so we can see the results
        await browser.customScreenshot("test-end");
    });


    // Setup the constraint template
    it('4 Setup Constraint Template', async () => {
        // Verify that the constraint template exists
        const templateListItem = await $("//table//td[contains(normalize-space(), 'k8scontainerlimits')]");
        expect(await templateListItem).toBePresent(
            {message: "The k8scontainerlimits constraint should be present"}
        );

        // Click on the constraint template to open the constraint template editing page
        await templateListItem.customClick("open-edit-page");
        expect(browser).toHaveUrl(
            buildUrl('private/clusters/1/gatekeeper/k8scontainerlimites'),
            {message: "m9sweeper should be displaying the k8scontainerlimits gatekeeper constraint page"}
        );

        // Get the constraint status field so we can tell if its is setup or not. We do not need to run
        // this test if it is already setup. This likely can happen if running tests locally.
        const statusText = await (await $("//mat-card-content//h1")).getText();

        // If the constraint is already setup then we should skip this test
        if (statusText !== "Not Setup") {
            pending("k8scontainerlimits constraint is already setup")
        }

        // Verify that the constraint template has not been configured yet
        expect(await $("//mat-card-content//h1[contains(normalize-space(), 'Not Setup')]")).toBePresent(
            {message: "k8scontainerlimits status should be showing as Not Setup"}
        );

        // Locate and click on the Add More button
        await $("//span[contains(text(), 'Add More')]").customClick("add-more");
        expect(await $("//div[contains(@class, 'cdk-overlay-container')]//app-add-template-constraint")).toBePresent(
            {message: "The dialog for adding a constraint template should be visable"}
        );

        // Locate and fill out the Name input
        const nameInputField = await $("//div[contains(@class, 'cdk-overlay-container')]//input[@formcontrolname='name']");
        expect(await nameInputField).toBePresent(
            {message: "The Name input field should exist"}
        );
        nameInputField.clearValue();
        nameInputField.setValue("testing-limit");

        // Locate and fill out the description input
        const descriptionInputField = await $("//div[contains(@class, 'cdk-overlay-container')]//input[@formcontrolname='description']");
        expect(await descriptionInputField).toBePresent(
            {message: "The Description input field should exist"}
        );
        descriptionInputField.clearValue();
        descriptionInputField.setValue("Limit created by automated testing");

        // Locate and fill out the cpu properties input
        const cpuInputField = await $("//div[contains(@class, 'cdk-overlay-container')]//input[@name='cpu']");
        expect(await cpuInputField).toBePresent(
            {message: "The CPU input field should exist"}
        );
        cpuInputField.clearValue();
        cpuInputField.setValue("2000m");

        // Locate and fill out the memory properties input
        const memoryInputField = await $("//div[contains(@class, 'cdk-overlay-container')]//input[@name='memory']");
        expect(await memoryInputField).toBePresent(
            {message: "The Memory input field should exist"}
        );
        memoryInputField.clearValue();
        memoryInputField.setValue("2Gi");

        // Locate and click the Save Changes button
        await $("//div[contains(@class, 'cdk-overlay-container')]//span[contains(text(), 'Save Changes')]").customClick("save-changes");
        expect(await $("//div[contains(@class, 'cdk-overlay-container')]//app-add-template-constraint")).not.toBePresent(
            {message: "The dialog for adding a constraint template should no longer be visable"}
        );

        // Wait for the alert stating the constraint was created successfully
        await $("//ff-alerts//div[contains(@class, 'content') and contains(normalize-space(), 'Constraint created successfully')]")
            .waitForDisplayed({timeout: 60000, interval: 1000, timeoutMsg: "Constraint created successfully alert did not appear, this suggests the constraint was not created sucessfully."});

        // Verify the status text is now showing Gatekeeper as setup
        expect(await $("//mat-card-content//h1[contains(normalize-space(), 'Setup')]")).toBePresent(
            {message: "The k8scontainerlimits constraint should be showing as setup."}
        );

        // Take a screenshot at the end so we can see the results
        await browser.customScreenshot("test-end");
    });
});