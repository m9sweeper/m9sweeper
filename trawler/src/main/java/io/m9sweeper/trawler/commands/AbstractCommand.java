package io.m9sweeper.trawler.commands;

import io.m9sweeper.trawler.TrawlerConfiguration;
import picocli.CommandLine;

/**
 * Provide a basic command with the options that should be able to be set globally
 */
@CommandLine.Command(synopsisHeading = "%nUsage:%n", descriptionHeading = "%nDescription:%n", parameterListHeading = "%nParameters:%n",
        optionListHeading = "%nOptions:%n", commandListHeading = "%nCommands:%n", sortOptions = false)
public abstract class AbstractCommand {

    @CommandLine.Option(names = {"-P", "--parallel-scans"}, description = "number of scanners that Trawler can run at once", order = 0)
    protected Integer trawlerParallelScanners;

    @CommandLine.Option(names = {"-U", "--url"}, description = "URL of the m9sweeper instance", order = 1)
    protected String m9sweeperUrl;

    @CommandLine.Option(names = {"-A", "--api-key"}, description = "API Key of the m9sweeper instance", order = 2)
    protected String m9sweeperApiKey;

    @CommandLine.Option(names = {"-D", "--debug"}, description = "whether to enable debug logs", order = 3)
    protected Boolean debug;

    @SuppressWarnings("unused")
    @CommandLine.Option(names = {"-h", "--help"}, usageHelp = true, description = "display this help and exit", order = 1000)
    protected boolean help = false;

    /**
     * Update the configuration using the options in this command
     */
    protected void updateConfig() {
        if (m9sweeperUrl != null) {
            TrawlerConfiguration.getInstance().setM9sweeperUrl(m9sweeperUrl);
        }

        if (m9sweeperApiKey != null) {
            TrawlerConfiguration.getInstance().setM9sweeperApiKey(m9sweeperApiKey);
        }

        if (trawlerParallelScanners != null) {
            TrawlerConfiguration.getInstance().setTrawlerParallelScanners(trawlerParallelScanners);
        }

        if (debug != null) {
            TrawlerConfiguration.getInstance().setDebug(debug);
        }
    }
}