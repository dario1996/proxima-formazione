package com.example.dataprocessor.controller;

import com.example.dataprocessor.service.JsonFileProcessingService;
import com.example.dataprocessor.service.StagingDataProcessingService;
import com.example.dataprocessor.service.StagingDataProcessingScheduler;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/data-processing")
@Slf4j
public class DataProcessingController {

    @Autowired
    private JsonFileProcessingService jsonFileProcessingService;

    @Autowired
    private StagingDataProcessingService stagingDataProcessingService;

    @Autowired
    private StagingDataProcessingScheduler stagingDataProcessingScheduler;

    /**
     * Manually trigger JSON file processing
     */
    @PostMapping("/json/process")
    public ResponseEntity<Map<String, Object>> processJsonFiles() {
        log.info("Manual JSON file processing triggered");

        try {
            jsonFileProcessingService.processAllJsonFiles();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "JSON file processing completed successfully");
            response.put("statistics", jsonFileProcessingService.getProcessingStatistics());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error during manual JSON file processing", e);

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());

            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Manually trigger staging data processing
     */
    @PostMapping("/staging/process")
    public ResponseEntity<Map<String, Object>> processStagingData() {
        log.info("Manual staging data processing triggered");

        try {
            StagingDataProcessingService.ProcessingSummary summary = stagingDataProcessingService
                    .processAllStagingData();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Staging data processing completed successfully");
            response.put("summary", Map.of(
                    "processed", summary.getProcessed(),
                    "errors", summary.getErrors(),
                    "total", summary.getTotal()));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error during manual staging data processing", e);

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());

            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Trigger complete pipeline: JSON files -> staging -> business tables
     */
    @PostMapping("/pipeline/run")
    public ResponseEntity<Map<String, Object>> runCompletePipeline() {
        log.info("Complete pipeline processing triggered");

        try {
            // Step 1: Process JSON files
            log.info("Step 1: Processing JSON files");
            jsonFileProcessingService.processAllJsonFiles();

            // Step 2: Process staging data
            log.info("Step 2: Processing staging data");
            StagingDataProcessingService.ProcessingSummary stagingSummary = stagingDataProcessingService
                    .processAllStagingData();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Complete pipeline processing completed successfully");
            response.put("jsonStatistics", jsonFileProcessingService.getProcessingStatistics());
            response.put("stagingSummary", Map.of(
                    "processed", stagingSummary.getProcessed(),
                    "errors", stagingSummary.getErrors(),
                    "total", stagingSummary.getTotal()));
            response.put("finalStats", stagingDataProcessingService.getProcessingStats());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error during complete pipeline processing", e);

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());

            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Get processing statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getProcessingStats() {
        try {
            StagingDataProcessingService.ProcessingStats stats = stagingDataProcessingScheduler.getStats();

            Map<String, Object> response = new HashMap<>();
            response.put("stagingStats", Map.of(
                    "totalStagingRecords", stats.getTotalStagingRecords(),
                    "processedRecords", stats.getProcessedRecords(),
                    "unprocessedRecords", stats.getUnprocessedRecords()));
            response.put("businessStats", Map.of(
                    "totalEmployees", stats.getTotalEmployees(),
                    "totalCourses", stats.getTotalCourses(),
                    "totalAssignments", stats.getTotalAssignments()));
            response.put("jsonStats", jsonFileProcessingService.getProcessingStatistics());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error getting processing statistics", e);

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());

            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Data Processing Service");
        return ResponseEntity.ok(response);
    }
}