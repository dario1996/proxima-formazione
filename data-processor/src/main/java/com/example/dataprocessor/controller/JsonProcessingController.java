package com.example.dataprocessor.controller;

import com.example.dataprocessor.service.JsonProcessingScheduler;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/json-processing")
@Slf4j
public class JsonProcessingController {

    @Autowired
    private JsonProcessingScheduler jsonProcessingScheduler;

    /**
     * Manually trigger JSON file processing
     * POST /api/json-processing/trigger
     */
    @PostMapping("/trigger")
    public ResponseEntity<Map<String, Object>> triggerProcessing() {
        try {
            log.info("Manual processing triggered via REST API");
            jsonProcessingScheduler.triggerManualProcessing();

            // Get updated statistics after processing
            Map<String, Object> stats = jsonProcessingScheduler.getProcessingStatistics();
            stats.put("message", "Processing completed successfully");
            stats.put("status", "success");

            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            log.error("Error during manual processing via REST API", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of(
                            "status", "error",
                            "message", "Processing failed: " + e.getMessage()));
        }
    }

    /**
     * Get current processing statistics
     * GET /api/json-processing/statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        try {
            Map<String, Object> stats = jsonProcessingScheduler.getProcessingStatistics();
            stats.put("status", "success");
            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            log.error("Error getting processing statistics via REST API", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of(
                            "status", "error",
                            "message", "Failed to get statistics: " + e.getMessage()));
        }
    }

    /**
     * Health check endpoint
     * GET /api/json-processing/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "healthy",
                "service", "data-processor",
                "message", "JSON processing service is running"));
    }
}