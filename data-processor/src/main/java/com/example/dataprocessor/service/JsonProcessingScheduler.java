package com.example.dataprocessor.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@Slf4j
@ConditionalOnProperty(value = "app.processing.enable-scheduler", havingValue = "true", matchIfMissing = true)
public class JsonProcessingScheduler {

    @Autowired
    private JsonFileProcessingService jsonFileProcessingService;

    @Value("${app.processing.scheduler-interval:30000}")
    private long schedulerInterval;

    /**
     * Scheduled task to process JSON files
     * Runs based on the configured interval (default: every 30 seconds)
     */
    @Scheduled(fixedDelayString = "${app.processing.scheduler-interval:30000}")
    public void processJsonFilesScheduled() {
        try {
            log.debug("Starting scheduled JSON file processing");

            // Get current statistics
            Map<String, Object> statsBefore = jsonFileProcessingService.getProcessingStatistics();
            log.debug("Processing statistics before: {}", statsBefore);

            // Process all JSON files
            jsonFileProcessingService.processAllJsonFiles();

            // Get updated statistics
            Map<String, Object> statsAfter = jsonFileProcessingService.getProcessingStatistics();
            log.debug("Processing statistics after: {}", statsAfter);

            // Log summary if there were changes
            long recordsBefore = (Long) statsBefore.get("totalRecords");
            long recordsAfter = (Long) statsAfter.get("totalRecords");

            if (recordsAfter > recordsBefore) {
                long newRecords = recordsAfter - recordsBefore;
                log.info("Scheduled processing completed. New records added: {}", newRecords);
            }

        } catch (Exception e) {
            log.error("Error during scheduled JSON file processing", e);
        }
    }

    /**
     * Manual trigger for JSON file processing
     * Can be called via REST API or other services
     */
    public void triggerManualProcessing() {
        log.info("Manual JSON file processing triggered");
        try {
            jsonFileProcessingService.processAllJsonFiles();
            log.info("Manual JSON file processing completed successfully");
        } catch (Exception e) {
            log.error("Error during manual JSON file processing", e);
            throw new RuntimeException("Manual processing failed", e);
        }
    }

    /**
     * Get current processing statistics
     */
    public Map<String, Object> getProcessingStatistics() {
        return jsonFileProcessingService.getProcessingStatistics();
    }
}