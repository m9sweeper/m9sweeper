package io.m9sweeper.trawler;

import io.m9sweeper.trawler.framework.client.api.M9SweeperApi;
import io.m9sweeper.trawler.framework.client.model.*;
import io.m9sweeper.trawler.framework.docker.DockerImageBuilder;
import io.m9sweeper.trawler.framework.docker.DockerRegistryBuilder;
import io.m9sweeper.trawler.framework.exception.NoncompliantException;
import io.m9sweeper.trawler.framework.policies.Policy;
import io.m9sweeper.trawler.framework.queue.Message;
import io.m9sweeper.trawler.framework.scans.*;
import io.m9sweeper.trawler.scanners.Trivy;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class ScanRunner {

    private final M9SweeperApi apiInstance;
    private final Message message;
    private final List<PolicyWithScannerDto> policies;

    public ScanRunner(M9SweeperApi apiInstance, Message message, List<PolicyWithScannerDto> policies) {
        this.apiInstance = apiInstance;
        this.message = message;
        this.policies = policies;
    }

    public void scan() throws Exception {
        ScanConfig scanConfig = new ScanConfig();
        scanConfig.setImage(new DockerImageBuilder(message.getImage().getId().intValue())
                .withName(message.getImage().getName())
                .withTag(message.getImage().getTag())
                .withHash(message.getImage().getHash())
                .withRegistry(new DockerRegistryBuilder(message.getRegistry().getHostname(), message.getRegistry().getLoginRequired(), message.getRegistry().getAuthType(), message.getRegistry().getAuthDetails())
                        .withAliases(message.getRegistry().getAliases())
                        .withName(message.getRegistry().getName())
                        .withUsername(message.getRegistry().getUsername())
                        .withPassword(message.getRegistry().getPassword())
                        .build())
                .build());

        long scanStartedAt = System.currentTimeMillis();

        ArrayList<ScanResult> scanResults = new ArrayList<>(0);

        String newImageHash = "";

        if (policies != null && policies.size() > 0) {
            for (PolicyWithScannerDto policyWithScannerDto: policies) {
                if (!policyWithScannerDto.isEnabled()) {
                    continue;
                }

                ScanResultBuilder scanResultBuilder = new ScanResultBuilder(scanConfig.getImage())
                        .withStartedAt(scanStartedAt)
                        .withPolicy(policyWithScannerDto.getId().longValue());

                ArrayList<ScanResultIssue> scanResultIssues = new ArrayList<>();

                if (policyWithScannerDto.getScanners().size() > 0) {
                    for (ScannerDto scannerDto : policyWithScannerDto.getScanners()) {
                        if (!scannerDto.isEnabled()) {
                            continue;
                        }
                        
                        try {
                            if (scannerDto.getType().toUpperCase().equals(ScannerType.TRIVY.name())) {
                                scanConfig.setScanId(scannerDto.getId().intValue());
                                scanConfig.setScannerName(scannerDto.getName());
                                scanConfig.setPolicy(new Policy() {{
                                    setEnforced(policyWithScannerDto.isEnforcement());
                                    setName(policyWithScannerDto.getName());
                                }});
                                Trivy t = new Trivy();
                                t.initScanner(scanConfig);
                                t.run();
                                scanResultIssues.addAll(t.getScanResult());
                                newImageHash = t.getImageHash();
                            } else {
                                System.out.println("Scanner " + scannerDto.getType().toUpperCase() + " is not implemented yet.");
                                throw new UnsupportedOperationException("Scanner " + scannerDto.getType().toUpperCase() + " is not implemented yet.");
                            }
                            scanResultBuilder.withEncounteredError(false);
                            scanResultBuilder.withSummary("");
                        } catch (Exception e) {
                            scanResultBuilder.withEncounteredError(true);
                            scanResultBuilder.withSummary(e.getMessage());
                        }
                    }
                } else {
                    scanResultBuilder.withEncounteredError(true);
                    scanResultBuilder.withSummary("No Scanner found");
                    if (TrawlerConfiguration.getInstance().getDebug()) System.out.println("policyWithScannerDto.getScanners().size(): " + policyWithScannerDto.getScanners().size());
                }

                int totalCriticalIssues = 0;
                int totalHighIssues = 0;
                int totalMediumIssues = 0;
                int totalLowIssues = 0;
                int totalNegligibleIssues = 0;

                if (TrawlerConfiguration.getInstance().getDebug()) System.out.println("scanResultIssues: " + scanResultIssues.size());

                if (scanResultIssues.size() > 0) {
                    for(ScanResultIssue scanResultIssue: scanResultIssues) {
                        if (scanResultIssue.getSeverity().equals(IssueSeverity.CRITICAL)) {
                            totalCriticalIssues++;
                        } else if (scanResultIssue.getSeverity().equals(IssueSeverity.HIGH)) {
                            totalHighIssues++;
                        } else if (scanResultIssue.getSeverity().equals(IssueSeverity.MEDIUM)) {
                            totalMediumIssues++;
                        } else if (scanResultIssue.getSeverity().equals(IssueSeverity.LOW)) {
                            totalLowIssues++;
                        } else if (scanResultIssue.getSeverity().equals(IssueSeverity.UNKNOWN) || scanResultIssue.getSeverity().equals(IssueSeverity.NEGLIGIBLE)) {
                            totalNegligibleIssues++;
                        }
                    }
                }

                scanResultBuilder.withNumCriticalIssues(totalCriticalIssues)
                        .withNumHighIssues(totalHighIssues)
                        .withNumMediumIssues(totalMediumIssues)
                        .withNumLowIssues(totalLowIssues)
                        .withNumNegligibleIssues(totalNegligibleIssues)
                        .withIssues(scanResultIssues)
                        .withFinishedAt(System.currentTimeMillis())
                        .withHash(newImageHash);

                scanResults.add(scanResultBuilder.build());
            }
        }

        if (TrawlerConfiguration.getInstance().getDebug()) {
            System.out.println("Scan Results: " + scanResults.toString());
        }

        List<ImageTrawlerResultDto> imageTrawlerResultDtos = scanResults.stream()
                .map(scanResult -> new ImageTrawlerResultDto()
                .summary(scanResult.getSummary())
                .encounterError(scanResult.isEncounteredError())
                .criticalIssues(new BigDecimal(scanResult.getNumCriticalIssues()))
                .majorIssues(new BigDecimal(scanResult.getNumHighIssues()))
                .mediumIssues(new BigDecimal(scanResult.getNumMediumIssues()))
                .lowIssues(new BigDecimal(scanResult.getNumLowIssues()))
                .negligibleIssues(new BigDecimal(scanResult.getNumNegligibleIssues()))
                .policyId(new BigDecimal(scanResult.getPolicyId()))
                .policyStatus(scanResult.getNumCriticalIssues() <= 0 && scanResult.getNumHighIssues() <= 0)
                .startedAt(new BigDecimal(scanResult.getStartedAt()))
                .finishedAt(new BigDecimal(scanResult.getFinishedAt()))
                .imageHash(scanResult.getImageHash())
                .issues(scanResult.getIssues().stream().map(o ->
                        new ScanImageIssue()
                                .scannerId(new BigDecimal(o.getScannerId()))
                                .scannerName(o.getScannerName())
                                .name(o.getName())
                                .type(o.getType())
                                .vulnerabilityDescUrl(o.getVulnerabilityDescUrl())
                                .severity(o.getSeverity().toString())
                                .description(o.getDescription())
                                .isCompliant(o.isCompliant())
                                .isFixable(o.isFixable())
                                .wasFixed(false)
                                .data(o.getExtraData())
                ).collect(Collectors.toList()))).collect(Collectors.toList());

        // If the image hash is different than the one stored in the DB, and it is not a temporary ID, give the scan an error result
        // Otherwise save the scan results normally
        if (!scanConfig.getImage().getHash().equals(newImageHash) && (scanConfig.getImage().getHash() != null && !scanConfig.getImage().getHash().startsWith("TMP_"))) {
            String errorSummary = "Image ID does not match most recent image pulled from Trawler";
            if (scanConfig.getImage().getTag().contains("latest")) {
                errorSummary = errorSummary.concat(". Note, using the latest tag for images is not recommended and can cause undesirable behavior");
            }
            ImageTrawlerResultDto outdatedImageIdResult = new ImageTrawlerResultDto()
                    .summary(errorSummary)
                    .encounterError(true)
                    .criticalIssues(new BigDecimal(0))
                    .majorIssues(new BigDecimal(0))
                    .mediumIssues(new BigDecimal(0))
                    .lowIssues(new BigDecimal(0))
                    .negligibleIssues(new BigDecimal(0))
                    .policyId(imageTrawlerResultDtos.get(0).getPolicyId());
            List<ImageTrawlerResultDto> outdatedImageIdArray = new ArrayList<ImageTrawlerResultDto>();
            outdatedImageIdArray.add(outdatedImageIdResult);
            saveScanResults(outdatedImageIdArray);
        } else {
            saveScanResults(imageTrawlerResultDtos);
        }
    }

    private void saveScanResults(List<ImageTrawlerResultDto> imageTrawlerResultDtos) throws Exception {
        TrawlerScanResults body = new TrawlerScanResults();
        body.setData(imageTrawlerResultDtos);
        if (TrawlerConfiguration.getInstance().getDebug()) {
            System.out.println("Saving Scan Results: " + body.toString());
        }
        ImageScanResultSaveResponse complianceResponse = apiInstance.imageControllerSaveImageScanResults(body, new BigDecimal(message.getCluster().getId()), new BigDecimal(message.getImage().getId()));
        if (complianceResponse.getData() != null && !complianceResponse.getData().isComplaint()) {
            throw new NoncompliantException("Image Is not compliant", imageTrawlerResultDtos);
        }
    }
}
