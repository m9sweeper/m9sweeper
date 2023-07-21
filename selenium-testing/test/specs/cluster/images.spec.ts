import { login } from '../../functions/login.js';
import { buildUrl } from '../../functions/build-url.js';
import { sleep } from '../../functions/sleep.js';

/**
 * Ensure that the Images page under the cluster section is functional
 */
describe('Images Page::', () => {
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

        // Move to the Images page
        await $("//span[@class='menu-item-name'][contains(text(), 'Images')]").customClick("images-page");
        expect(browser).toHaveUrl(
            buildUrl('private/clusters/1/images'),
            {message: "m9sweeper should be displaying the Images page"}
        );

        // Take a screenshot at the end so we can see the results
        await browser.customScreenshot("test-end");
    });


    // Verify we are able to use the button to scan displayed images
    it('2 Scan Displayed Images', async () => {
        // Locate the Scan Displayed Images button and click on it
        await $("//button/span[contains(normalize-space(), 'Scan Displayed Images')]").customClick("scan-displayed-images");
        expect(await $("//app-confirm-scan-all-dialog")).toBePresent(
            {message: "The confirmation window for scanning the images should be visable"}
        );

        // Locate and click the scan button to start the image scan
        await $("//div[contains(@class, 'cdk-overlay-container')]//button/span[contains(normalize-space(), 'Scan')]").customClick("scan");
        expect(await $("//app-confirm-scan-all-dialog")).not.toBePresent(
            {message: "The confirmation window for scanning the images should no longer be visable"}
        );

        // Wait for the alert confirming that the image scan has been queued
        await $("//ff-alerts//div[contains(@class, 'content') and contains(normalize-space(), 'Image Scan queued')]")
            .waitForDisplayed({timeout: 60000, interval: 1000, timeoutMsg: "Image Scan queued alert was not displayed, this suggests that the image scan was not queued successfully."});

        // Take a screenshot at the end so we can see the results
        await browser.customScreenshot("test-end");
    });


    // Verify that we can search for an image and it will find it
    it('3 Verify Search Works', async () => {
        // Locate the search bar
        const searchBar = await $("//label[contains(normalize-space(), 'Search image')]/parent::div//input[@type='search']");
        expect(await searchBar).toBePresent(
            {message: "Image search bar should be present"}
        );

        // Clear the value in the search bar and enter our search query
        await searchBar.clearValue();
        await searchBar.setValue("sweeper/dash");

        // Sleep for 2 seconds to allow the search to happen
        await sleep(2000);

        // Verify that a element with the query term exists
        expect(await $("//mat-row/mat-cell[contains(normalize-space(), 'sweeper/dash')]")).toBePresent(
           {message: "The image we searched for should show up in the search results"}
        );

        // Take a screenshot at the end so we can see the results
        await browser.customScreenshot("test-end");
    });

    // Verify that an image page loads and that we can trigger a rescan of the image
    it('4 Image page and rescan can be triggered', async () => {
        // Click on the image we searched for above
        await $("//mat-row/mat-cell[contains(normalize-space(), 'sweeper/dash')]").customClick("open-image-page");

        // Wait 2 seconds for the page to load
        sleep(2000);

        // Verify we are on the right page
        expect(await $("//span[contains(normalize-space(), 'sweeper/dash')]")).toBePresent(
           {message: "We should be on the page for the m9sweeper dash image"}
        );

        // Locate the button used to scan/rescan images. It maye be labled as Rescan Image or Scan Image depending on if the image has been scanned or not yet.
        // We also want to wait until it is clickable, it may take a while if a scan is currently in progress.
        await $("//span[contains(normalize-space(),'can Image')]").waitForClickable({timeout: 120000, interval: 1000, timeoutMsg: "Timed out waiting for the Rescan Image button to be usable."});
        await $("//span[contains(normalize-space(),'can Image')]").customClick("rescan-image");

        // Wait for the alert confirming that the image scan has been queued
        await $("//ff-alerts//div[contains(@class, 'content') and contains(normalize-space(), 'Image Scan Queued')]")
            .waitForDisplayed({timeout: 60000, interval: 1000, timeoutMsg: "Image Scan queued alert was not displayed, this suggests that the image scan was not queued successfully."});

        // Take a screenshot at the end so we can see the results
        await browser.customScreenshot("test-end");
    });

    it('5 Manually add image', async () => {
        // Return to the base images page
        await browser.back();
        expect(browser).toHaveUrl(
            buildUrl('private/clusters/1/images'),
            {message: "m9sweeper should be displaying the Images page"}
        );

        // Locate the + button to add a image and click on it
        await $("//mat-icon[contains(@class, 'plus-button')]/parent::button/span[contains(@class, 'mat-mdc-button-touch-target')]").customClick("add-image-button");
        expect(await $("//app-create-image")).toBePresent(
            {message: "The popup for adding a image should be displayed"}
        );

        // Locate the Image URL text field and enter the dummy image
        const imageUrlField = await $("//div[contains(@class, 'cdk-overlay-container')]//app-create-image//input");
        expect(await imageUrlField).toBePresent(
            {message: "The input field for entering the image URL should be present"}
        );
        await imageUrlField.clearValue();
        await imageUrlField.setValue("docker.io/dummy-image:latest");

        // Locate the submit button and click it
        await $("//div[contains(@class, 'cdk-overlay-container')]//button[@type='submit']").customClick("submit");
        expect(await $("//app-create-image")).not.toBePresent(
            {message: "The popup for adding a image should no longer be displayed"}
        );

        // Wait for the alert stating the image has been added
        await $("//ff-alerts//div[contains(@class, 'content') and contains(normalize-space(), 'Image created successfully')]")
            .waitForDisplayed({timeout: 60000, interval: 1000, timeoutMsg: "Image created successfully alert did not appear, this suggests the image was not added successfully."});

        // Locate the search bar
        const searchBar = await $("//label[contains(normalize-space(), 'Search image')]/parent::div//input[@type='search']");
        expect(await searchBar).toBeExisting(
            {message: "Image search bar should be present"}
        );

        // Clear the value in the search bar and enter our search query
        await searchBar.clearValue();
        await searchBar.setValue("docker.io/dummy-image:latest");

        // Sleep for 2 seconds to allow the search to happen
        await sleep(2000);

        // Verify that a element with the query term exists
        expect(await $("//mat-row/mat-cell[contains(normalize-space(), 'docker.io/dummy-image:latest')]")).toBePresent(
            {message: "The image we searched for should show up in the search results"}
        );

        // Take a screenshot at the end so we can see the results
        await browser.customScreenshot("test-end");
    });


    // it('5 Verify Advanced Search Works', () => {

    // });
});