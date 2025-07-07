package com.example.dataprocessor.service;

import com.example.dataprocessor.entity.LearningDataRecord;
import com.example.dataprocessor.repository.LearningDataRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@Slf4j
public class JsonFileProcessingService {

    @Autowired
    private LearningDataRepository learningDataRepository;

    @Value("${app.json.input-folder:../batch-processor/output}")
    private String inputFolder;

    @Value("${app.json.processed-folder:processed}")
    private String processedFolder;

    @Value("${app.json.error-folder:error}")
    private String errorFolder;

    @Value("${app.processing.chunk-size:100}")
    private int chunkSize;

    private final ObjectMapper objectMapper;

    public JsonFileProcessingService() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    /**
     * Main method to process all JSON files in the input folder
     */
    @Transactional
    public void processAllJsonFiles() {
        log.info("Starting JSON file processing from folder: {}", inputFolder);

        try {
            Path inputPath = createPathIfNotExists(inputFolder);
            Path processedPath = createPathIfNotExists(processedFolder);
            Path errorPath = createPathIfNotExists(errorFolder);

            // Find all JSON files in input folder
            List<File> jsonFiles = findJsonFiles(inputPath.toFile());
            log.info("Found {} JSON files to process", jsonFiles.size());

            int processedCount = 0;
            int errorCount = 0;

            for (File jsonFile : jsonFiles) {
                try {
                    if (isFileAlreadyProcessed(jsonFile.getName())) {
                        log.info("File {} already processed, skipping", jsonFile.getName());
                        continue;
                    }

                    log.info("Processing file: {}", jsonFile.getName());
                    ProcessingResult result = processSingleJsonFile(jsonFile);

                    if (result.isSuccess()) {
                        moveFileToProcessed(jsonFile, processedPath);
                        processedCount++;
                        log.info("Successfully processed file: {} - {} records imported",
                                jsonFile.getName(), result.getRecordsProcessed());
                    } else {
                        moveFileToError(jsonFile, errorPath);
                        errorCount++;
                        log.error("Failed to process file: {} - {}", jsonFile.getName(), result.getErrorMessage());
                    }

                } catch (Exception e) {
                    log.error("Unexpected error processing file: {}", jsonFile.getName(), e);
                    try {
                        moveFileToError(jsonFile, errorPath);
                        errorCount++;
                    } catch (IOException ioException) {
                        log.error("Failed to move error file: {}", jsonFile.getName(), ioException);
                    }
                }
            }

            log.info("JSON file processing completed. Processed: {}, Errors: {}", processedCount, errorCount);

        } catch (Exception e) {
            log.error("Error during JSON file processing", e);
            throw new RuntimeException("Failed to process JSON files", e);
        }
    }

    /**
     * Process a single JSON file and save records to staging table
     */
    @Transactional
    public ProcessingResult processSingleJsonFile(File jsonFile) {
        try {
            log.debug("Reading JSON file: {}", jsonFile.getAbsolutePath());

            // Read JSON file
            List<LearningDataRecord> records = objectMapper.readValue(
                    jsonFile, new TypeReference<List<LearningDataRecord>>() {
                    });

            log.debug("Parsed {} records from file: {}", records.size(), jsonFile.getName());

            // Validate and prepare records
            List<LearningDataRecord> validRecords = new ArrayList<>();
            int invalidCount = 0;

            for (LearningDataRecord record : records) {
                if (record.isValid()) {
                    record.setSourceFile(jsonFile.getName());
                    record.setProcessed(false);

                    // Check for duplicates
                    if (!isDuplicateRecord(record)) {
                        validRecords.add(record);
                    } else {
                        log.debug("Skipping duplicate record: {} - {}", record.getEmail(), record.getContentName());
                    }
                } else {
                    invalidCount++;
                    log.warn("Invalid record skipped - Email: {}, Content: {}",
                            record.getEmail(), record.getContentName());
                }
            }

            // Save records in chunks
            int savedCount = saveRecordsInChunks(validRecords);

            log.info("File processing summary - Total: {}, Valid: {}, Invalid: {}, Saved: {}, Duplicates: {}",
                    records.size(), validRecords.size(), invalidCount, savedCount,
                    validRecords.size() - savedCount);

            return new ProcessingResult(true, savedCount, null);

        } catch (Exception e) {
            log.error("Error processing JSON file: {}", jsonFile.getName(), e);
            return new ProcessingResult(false, 0, e.getMessage());
        }
    }

    /**
     * Save records in chunks for better performance
     */
    private int saveRecordsInChunks(List<LearningDataRecord> records) {
        int savedCount = 0;

        for (int i = 0; i < records.size(); i += chunkSize) {
            int endIndex = Math.min(i + chunkSize, records.size());
            List<LearningDataRecord> chunk = records.subList(i, endIndex);

            try {
                List<LearningDataRecord> savedChunk = learningDataRepository.saveAll(chunk);
                savedCount += savedChunk.size();
                log.debug("Saved chunk {}-{} ({} records)", i + 1, endIndex, savedChunk.size());
            } catch (Exception e) {
                log.error("Error saving chunk {}-{}", i + 1, endIndex, e);
                // Continue with next chunk
            }
        }

        return savedCount;
    }

    /**
     * Check if a record is a duplicate
     */
    private boolean isDuplicateRecord(LearningDataRecord record) {
        return learningDataRepository.findByEmailAndContentName(
                record.getEmail(), record.getContentName()).isPresent();
    }

    /**
     * Check if file has been processed before
     */
    private boolean isFileAlreadyProcessed(String filename) {
        return learningDataRepository.existsBySourceFile(filename);
    }

    /**
     * Find all JSON files in directory
     */
    private List<File> findJsonFiles(File directory) {
        List<File> jsonFiles = new ArrayList<>();

        if (directory.exists() && directory.isDirectory()) {
            File[] files = directory.listFiles((dir, name) -> name.toLowerCase().endsWith(".json"));

            if (files != null) {
                Arrays.sort(files, Comparator.comparing(File::lastModified));
                jsonFiles.addAll(Arrays.asList(files));
            }
        }

        return jsonFiles;
    }

    /**
     * Create directory path if it doesn't exist
     */
    private Path createPathIfNotExists(String folderPath) throws IOException {
        Path path = Paths.get(folderPath);
        if (!Files.exists(path)) {
            Files.createDirectories(path);
            log.info("Created directory: {}", path.toAbsolutePath());
        }
        return path;
    }

    /**
     * Move processed file to processed folder
     */
    private void moveFileToProcessed(File file, Path processedPath) throws IOException {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String newName = timestamp + "_" + file.getName();
        Path targetPath = processedPath.resolve(newName);

        Files.move(file.toPath(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        log.debug("Moved file to processed: {}", targetPath);
    }

    /**
     * Move error file to error folder
     */
    private void moveFileToError(File file, Path errorPath) throws IOException {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String newName = "ERROR_" + timestamp + "_" + file.getName();
        Path targetPath = errorPath.resolve(newName);

        Files.move(file.toPath(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        log.debug("Moved file to error: {}", targetPath);
    }

    /**
     * Get processing statistics
     */
    public Map<String, Object> getProcessingStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRecords", learningDataRepository.count());
        stats.put("unprocessedRecords", learningDataRepository.countByProcessed(false));
        stats.put("processedRecords", learningDataRepository.countByProcessed(true));
        stats.put("recentlyProcessed", learningDataRepository.findRecentlyProcessed(
                LocalDateTime.now().minusHours(24)).size());
        return stats;
    }

    /**
     * Processing result class
     */
    public static class ProcessingResult {
        private final boolean success;
        private final int recordsProcessed;
        private final String errorMessage;

        public ProcessingResult(boolean success, int recordsProcessed, String errorMessage) {
            this.success = success;
            this.recordsProcessed = recordsProcessed;
            this.errorMessage = errorMessage;
        }

        public boolean isSuccess() {
            return success;
        }

        public int getRecordsProcessed() {
            return recordsProcessed;
        }

        public String getErrorMessage() {
            return errorMessage;
        }
    }
}