import { login } from '../../functions/login.js';
import { buildUrl } from '../../functions/build-url.js';
import { sleep } from '../../functions/sleep.js';
import { Key } from 'webdriverio';
import { download } from '../../functions/download.js';


/**
 * Ensure that the kubesec page is functional and that KubeSec runs and reports its results properly
 */
describe('KubeSec Page::', () => {
    // Login to m9sweeper and navigate to the images page
    it('1 Login and navigate to page', async () => {
        // Login to m9sweeper
        await login();
        expect(browser).toHaveUrl(
            buildUrl('private/dashboard/group/1'),
            {message: "m9sweeper should have logged in and loaded the default dashboard"}
        );

        // Open the default cluster
        await $("//mat-card-title[contains(text(),'default-cluster')]").customClick("load-default-cluster");
        expect(browser).toHaveUrl(
            buildUrl('private/clusters/1/summary'),
            {message: "m9sweeper should be displaying the cluster summary for the default cluster"}
        );

        // Move to the kubesec page
        await $("//span[@class='menu-item-name'][contains(text(), 'KubeSec')]").customClick("kubesec-page");
        expect(browser).toHaveUrl(
            buildUrl('private/clusters/1/kubesec'),
            {message: "m9sweeper should be displaying the KubeSec page"}
        );

        // Take a screenshot at the end so we can see the results
        await browser.customScreenshot("test-end");
    });


    // Run a kubesec scan against a single image by selecting the m9sweeper-dash pod since we know it should always be present
    it('2 Run a KubeSec scan for single image', async () => {
        // Locate and selec the Choose pods from your cluster option
        await $("//label[contains(normalize-space(), 'Choose pods from your cluster')]").customClick("choose-pods-from-cluster");
        expect(await $("//label[contains(normalize-space(), 'Choose pods from your cluster')]/parent::div/parent::mat-radio-button")).toHaveElementClassContaining(
            "mat-mdc-radio-checked",
            {message: "The Choose pods from your cluster radio button should be selected"}
        );

        // Locate the Select Namespace dropdown and click on it to open it up
        await $("//mat-select[@formcontrolname='namespaceFormControl']").customClick("open-namespace-selection");
        expect(await $("//div[contains(@class, 'cdk-overlay-container')]//div[@role='listbox']")).toBePresent(
            {message: "The dropdown for selecting a namespace should be visable"}
        );

        // Select the m9sweeper-system namespace
        await $("//div[contains(@class, 'cdk-overlay-container')]//mat-option[contains(normalize-space(), 'm9sweeper-system')]").customClick("select-m9sweeper-system");
        expect(await $("//div[contains(@class, 'cdk-overlay-container')]//mat-option[contains(normalize-space(), 'm9sweeper-system')]")).toHaveElementClassContaining(
            "mat-mdc-option-active",
            {message: "The m9sweeper-system namespace should be selected"}
        );

        // Close the dropdown by sending the escape character
        await browser.keys(Key.Escape);
        expect(await $("//div[contains(@class, 'cdk-overlay-container')]//div[@role='listbox']")).not.toBePresent(
            {message: "The dropdown for selecting a namespace should not be visable"}
        );

        // Locate the Select a pod dropdown and click on it to open it up
        await $("//mat-select[@formcontrolname='podFormControl']").customClick("open-pod-selection");
        expect(await $("//div[contains(@class, 'cdk-overlay-container')]//div[@role='listbox']")).toBePresent(
            {message: "The dropdown for selecting a pod should be visable"}
        );

        // Selet the m9sweeper-dash pod
        await $("//div[contains(@class, 'cdk-overlay-container')]//mat-option[contains(normalize-space(), 'm9sweeper-dash-') and not(contains(normalize-space(), 'init'))]")
            .customClick("select-m9sweeper-pod");
        expect(await $("//div[contains(@class, 'cdk-overlay-container')]//mat-option[contains(normalize-space(), 'm9sweeper-dash-') and not(contains(normalize-space(), 'init'))]"))
            .toHaveElementClassContaining(
                "mat-mdc-option-active",
                {message: "The m9sweeper-dash pod should be selected"}
            );

        // Close the dropdown by sending the escape character
        await browser.keys(Key.Escape);
        expect(await $("//div[contains(@class, 'cdk-overlay-container')]//div[@role='listbox']")).not.toBePresent(
            {message: "The dropdown for selecting a pod should not be visable"}
        );

        // Locate and click the Run Kubesec button
        await $("//button[contains(normalize-space(), 'Run Kubesec')]").customClick("run-kubesec");

        // Wait up to 2 minutes for the report score to exist so we know that the report has finished loading
        await $("//div[contains(@class, 'pod-score')]//div[contains(@class, 'score')]").waitForExist(
            {
                timeout: 120000,
                timeoutMsg: "Kubesec did not return a result within 2 minutes, it can be assumed something has gone wrong"
            }
        );

        // Locate the section that shows the score. This helps verify that kubesec did indeed run.
        expect(await $("//div[contains(@class, 'pod-score')]//div[contains(@class, 'score')]")).toBePresent(
            {message: "The section for the kubesec score should be present"}
        );

        // Locate the tables section, this would be populated with items such as the Advice table. We do not check for a specific one here
        // as they may change depending on the image scanned and other factors with the deployment.
        expect(await $("//div[@class='tables']")).toBePresent(
            {message: "The section for the tables should be present"}
        );

        // Take a screenshot at the end so we can see the results
        await browser.customScreenshot("test-end");
    });


    // Download the kubesec report
    it('3 Download the kubesec report', async () => {
        // Locate the download link
        const downloadLink = await $("//a[@download='kubesec-report.json']");
        expect(await downloadLink).toBePresent(
            {message: "Kubesec download report link should be present"}
        );

        // Make sure we can download the file
        expect(await download('kubesec-report.json', downloadLink, {customClickMessage: "download-report"})).toBe(true);
    });


    // Run a kubesec scan against the entire m9sweeper namespace so we can that the multi-report window functions
    it('4 Run a KubeSec scan for multiple pods', async () => {
        // Refresh the page so we get back to a blank screen for running the scan
        await browser.refresh();

        // Locate and selec the Choose pods from your cluster option
        await $("//label[contains(normalize-space(), 'Choose pods from your cluster')]").customClick("choose-pods-from-cluster");
        expect(await $("//label[contains(normalize-space(), 'Choose pods from your cluster')]/parent::div/parent::mat-radio-button")).toHaveElementClassContaining(
            "mat-mdc-radio-checked",
            {message: "The Choose pods from your cluster radio button should be selected"}
        );

        // Locate the Select Namespace dropdown and click on it to open it up
        await $("//mat-select[@formcontrolname='namespaceFormControl']").customClick("open-namespace-selection");
        expect(await $("//div[contains(@class, 'cdk-overlay-container')]//div[@role='listbox']")).toBePresent(
            {message: "The dropdown for selecting a namespace should be visable"}
        );

        // Select the m9sweeper-system namespace
        await $("//div[contains(@class, 'cdk-overlay-container')]//mat-option[contains(normalize-space(), 'm9sweeper-system')]").customClick("select-m9sweeper-system");
        expect(await $("//div[contains(@class, 'cdk-overlay-container')]//mat-option[contains(normalize-space(), 'm9sweeper-system')]")).toHaveElementClassContaining(
            "mat-mdc-option-active",
            {message: "The m9sweeper-system namespace should be selected"}
        );

        // Close the dropdown by sending the escape character
        await browser.keys(Key.Escape);
        expect(await $("//div[contains(@class, 'cdk-overlay-container')]//div[@role='listbox']")).not.toBePresent(
            {message: "The dropdown for selecting a namespace should not be visable"}
        );

        // Locate the Select a pod dropdown and click on it to open it up
        await $("//mat-select[@formcontrolname='podFormControl']").customClick("open-pod-selection");
        expect(await $("//div[contains(@class, 'cdk-overlay-container')]//div[@role='listbox']")).toBePresent(
            {message: "The dropdown for selecting a pod should be visable"}
        );

        // Selet the All items option
        await $("//div[contains(@class, 'cdk-overlay-container')]//mat-option[contains(normalize-space(), 'All items')]")
            .customClick("select-all-items");
        expect(await $("//div[contains(@class, 'cdk-overlay-container')]//mat-option[contains(normalize-space(), 'All items')]"))
            .toHaveElementClassContaining(
                "mdc-list-item--selected",
                {message: "The All items option should be selected"}
            );

        // Close the dropdown by sending the escape character
        await browser.keys(Key.Escape);
        expect(await $("//div[contains(@class, 'cdk-overlay-container')]//div[@role='listbox']")).not.toBePresent(
            {message: "The dropdown for selecting a pod should not be visable"}
        );

        // Locate and click the Run Kubesec button
        await $("//button[contains(normalize-space(), 'Run Kubesec')]").customClick("run-kubesec");

        // Wait up to 2 minutes for the report score to exist so we know that the report has finished loading
        await $("//mat-toolbar//span[contains(normalize-space(), 'Reports')]").waitForExist(
            {
                timeout: 120000,
                timeoutMsg: "Kubesec did not return a result within 2 minutes, it can be assumed something has gone wrong"
            }
        );

        // Verify the reports page has loaded
        expect(await $("//mat-toolbar//span[contains(normalize-space(), 'Reports')]")).toBePresent(
            {message: "Reports table should be visable"}
        );

        // TODO: Once issue 6673 is completed this can be done
        // Locate the link for the m9sweeper-dash pod's report and open it
        await $("//a[contains(normalize-space(), 'm9sweeper-dash-') and not(contains(normalize-space(), 'init'))]").customClick("open-dash-report");
        // expect(await $("")).toBePresent(
        //     {message: "The m9sweeper-dash pod's report should be open in a popup window"}
        // );

        // Take a screenshot at the end so we can see the results
        await browser.customScreenshot("test-end");
    });
});