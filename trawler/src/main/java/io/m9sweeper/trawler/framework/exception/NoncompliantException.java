package io.m9sweeper.trawler.framework.exception;

import io.m9sweeper.trawler.framework.client.model.ImageTrawlerResultDto;

import java.util.List;

public class NoncompliantException extends Exception {
    List<ImageTrawlerResultDto> scanResults;
    public NoncompliantException(String message) {
        super(message);
    }

    public NoncompliantException(String message, List<ImageTrawlerResultDto> scanResults) {
        super(message);
        this.scanResults = scanResults;
    }

    public List<ImageTrawlerResultDto> getScanResults() {
        return scanResults;
    }

    @Override
    public synchronized Throwable fillInStackTrace() {
        return this; // Return the current exception instance without filling the stack trace
    }
}
