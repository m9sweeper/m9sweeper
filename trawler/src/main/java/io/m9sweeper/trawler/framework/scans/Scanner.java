package io.m9sweeper.trawler.framework.scans;

import java.util.List;

/**
 * Create and run the scanner. This runnable defaults to running the scanner methods in the following order:
 * 1. initScanner()
 * 2. prepSystem()
 * 3. runScan()
 * 4. parseResults()
 * 5. cleanup()
 *
 * You may wish to override the default run method described here to better handle errors for the scanner.
 */
public interface Scanner extends Runnable {
    /**
     * Initializes the Scanner. This is a required Scanner method
     * and is should be used to initialize the configuration for the plugin and any
     * plugin specific things. This acts as the constructor for the scanner.
     *
     * @param scanConfig        the ScanConfig that defines the plugin settings and scan information
     * @see ScanConfig
     * @see io.m9sweeper.trawler.framework.scans.Scanner
     */
    void initScanner(ScanConfig scanConfig);

    /**
     * Prepares the host system and plugin for running a scan.
     * Anything that needs to be done prior to a scan being run
     * should be placed in here.
     */
    void prepSystem();

    /**
     * Runs the scan as defined by the ScanConfig passed into the scanner
     * in the {@link #initScanner(ScanConfig)} method. This should start the scan,
     * and wait for it to complete. Raw scan results should be saved so they can be executed
     * in the next stage, {@link #parseResults()}.
     */
    void runScan() throws Exception;

    /**
     * This runs after the scan has been completed. Logic that will parse the results and store them in
     * the ScanResult object so the result can get reported back to m9sweeper or output to the console
     * if running in the standalone mode.
     */
    void parseResults();

    /**
     * Cleans up the host system and any plugin specific items. This method and should be used to
     * remove any containers, images, networks, or other resources created while running the scan.
     */
    void cleanup();

    /**
     * Report the results of the scan to m9sweeper.
     */
    List<ScanResultIssue> getScanResult();

    /**
     * This is the default run method the runnable will use when being executed. It can be overwritten
     * in the scanner class if you wish to customize its execution or error handling.
     */
    @Override
    default void run() throws RuntimeException {
        try {
            prepSystem();
            runScan();
            parseResults();
            cleanup();
        } catch (Exception ex) {
            System.err.println("RuntimeException");
            ex.printStackTrace();
            throw new RuntimeException(ex);
        }
    }
}