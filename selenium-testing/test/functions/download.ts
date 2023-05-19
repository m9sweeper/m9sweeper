import * as fs from "fs";
import * as path from "path";

export interface downloadTestOptions {
    /**
     * Maximum amount of time (in ms) to wait for the file to exist.
     * Defaults to 10000ms (10 seconds)
     * */
    timeout?: number;

    /**
     * Add a custom message to the click handler.
     * Defaults to: 'Downloading [filename]'
     * */
    customClickMessage?: string;

    /**
     * Callback function to call on the contents of the file for validating the contents
     * @param created Whether or not the file was created
     * @param filename the name of the file that was originally created (its raw value, not what it was renamed to)
     * @param buf A buffer containing the file contents
     * */
    callback?: (created: boolean, filename: string, buf: Buffer) => any;

    /**
     * If set, will rename the file after it is downloaded.
     * Allows you to keep multiple downloads from the same source.
     * Will overwrite any pre-existing file with this name.
     */
    renameTo?: string;

    /**
     * Regular expression for the filename if it has a generated name.
     */
    filenameRegex?: RegExp;
}

/**
 * Clicks an element to trigger a download and ensure the file is created
 *
 * @param filename The name the file should have after being downloaded
 * @param element The element that should be clicked to trigger the download. Ensure it exists before calling this function
 * @param options Optional extra settings
 */
export async function download(filename: string, element: WebdriverIO.Element, options?: downloadTestOptions ): Promise<boolean> {
    try {
        let filePath = path.join(downloadDir, filename);

        // If the file already exists, delete it
        // Otherwise it will download something like 'file (1).csv'.
        if (fs.existsSync(filePath)) {
            fs.rmSync(filePath);
        }

        // Trigger the download
        const dlStart = Date.now();

        await element.customClick(options?.customClickMessage || `Downloading ${filename}`);
        const createdFilename = await waitForFileToExist(options?.filenameRegex || filename, options?.timeout || 10000, dlStart);

        if (createdFilename && !!options?.renameTo) {
            fs.renameSync(path.join(downloadDir, createdFilename), path.join(downloadDir, options.renameTo));
            filePath = path.join(downloadDir, options.renameTo);
        }

        if (options?.callback) {
            const fileBuffer = createdFilename ? fs.readFileSync(filePath) : undefined;
            await options.callback(!!createdFilename, createdFilename, fileBuffer);
        }

        return !!createdFilename;
    } catch (err) {
        console.error('Error downloading file', err);
        throw err;
    }
}

async function waitForFileToExist(filename: RegExp | string, timeout: number, downloadStart: number): Promise<string> {
    return new Promise((resolve, reject) => {
        let timer;
        let watcher;
        try {
            // Start watching for file changes in the download directory
            const watcher = fs.watch(downloadDir, (eventType, eventFilename) => {
                // If a file in the download directory is renamed to our desired filename, it exists.
                // We wait for a rename event because downloads work by creating a temporary file and then renaming it
                // once the download is completed.
                if (eventType !== 'rename') {
                    return;
                }
                const fileMatch = typeof filename === 'string'
                    ? filename === eventFilename
                    : filename.test(eventFilename);
                if (fileMatch) {
                    console.info('File was downloaded');
                    watcher.close();
                    clearTimeout(timer);
                    resolve(eventFilename);
                }
            });

            // Check if the file exists in case it finished downloading before we started watching the directory
            if (typeof filename === 'string') {
                // If we are looking for a specific file, check that path
                const filePath = path.join(downloadDir, filename);
                fs.stat(filePath, (err) => {
                    // If there was no error, that means the file already exists
                    if (!err) {
                        console.info('File was downloaded');
                        watcher?.close();
                        clearTimeout(timer);
                        resolve(filename);
                    }
                });
            } else {
                // If we were given a regex for files, iterate over the files in the directory to find if any match
                fs.readdir(downloadDir, (err, files: string[]) => {
                    files.forEach((fname) => {
                        if (filename.test(files[0])) {
                            const stat = fs.statSync(path.join(downloadDir, fname));
                            // If the file matches the regex & was created after we started downloading,
                            // it should be the downloaded file
                            if (stat.birthtimeMs >= downloadStart) {
                                clearTimeout(timer);
                                watcher?.close();
                                return resolve(fname);
                            }
                        }
                    });
                });
            }

            // Start the timeout
            timer = setTimeout(() => {
                console.info('File did not exist in time');
                watcher.close();
                resolve(null);
            }, timeout);
        } catch (err) {
            console.error('Error waiting for file download', err);
            watcher?.close();
            clearTimeout(timer);
            reject(err);
        }
    })
}