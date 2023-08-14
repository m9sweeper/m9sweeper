import * as fs from 'fs';

/**
 * Configures the download and verify function for downloading a file and verifying it is present on the file system
 */
export interface downloadOptions {
    /**
     * The element to click on to trigger the download
     */
    element: WebdriverIO.Element,

    /**
     * The name of the file or a valid regex expression to locate the file
     */
    filenameOrRegex: string | RegExp,

    /**
     * The time in seconds to wait for the file to be present. Defaults to 30 seconds.
     */
    timeout?: 30
}

/**
 * Provides a common function for clicking on an element and verifying the file that click downloads is present on the filesystem
 *
 * @param options The options for downloading the file and verifying it
 */
export async function downloadAndVerify(options: downloadOptions): Promise<boolean> {
    // Click on the element to trigger the file download
    await options.element.click();

    // Load the time the download was started
    const startTime = Date.now();

    // Loop until the file has been found or the timeout has been reached
    while (Date.now() - startTime < (options.timeout * 1000)) {
        // List files in the download directory
        // @ts-ignore
        const files = fs.readdirSync(__downloadDir);

        // Search for the file based on filename or regex
        const foundFile = files.find((file) =>
            typeof options.filenameOrRegex === 'string'
                ? file.includes(options.filenameOrRegex)
                : options.filenameOrRegex.test(file)
        );

        // Return that the file was found if it was
        if (foundFile) {
            return true;
        }

        // Wait for 1 second before checking again
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // File not found within the timeout
    return false;
}