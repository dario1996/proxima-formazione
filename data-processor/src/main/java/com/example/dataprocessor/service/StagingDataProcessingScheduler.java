package com.example.dataprocessor.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class StagingDataProcessingScheduler {

    @Autowired
    private StagingDataProcessingService stagingDataProcessingService;

    @Value("${app.processing.enabled:true}")
    private boolean processingEnabled;

    /**
     * Scheduled task to process staging data every 5 minutes
     */
    @Scheduled(fixedRateString = "${app.processing.interval:300000}") // Default 5 minutes
    public void processStaging() {
        if (!processingEnabled) {
            log.debug("Staging data processing is disabled");
            return;
        }

        try {
            log.info("Starting scheduled staging data processing");
            StagingDataProcessingService.ProcessingSummary summary = stagingDataProcessingService
                    .processAllStagingData();

            if (summary.getTotal() > 0) {
                log.info("Scheduled processing completed: {}", summary);
            } else {
                log.debug("No staging data to process");
            }

        } catch (Exception e) {
            log.error("Error during scheduled staging data processing", e);
        }
    }

    /**
     * Get current processing statistics
     */
    public StagingDataProcessingService.ProcessingStats getStats() {
        return stagingDataProcessingService.getProcessingStats();
    }
}