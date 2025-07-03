package com.example.batchprocessor.writer;

import com.example.batchprocessor.model.LearningDataRecord;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.springframework.batch.item.Chunk;
import org.springframework.batch.item.ItemWriter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * Writes processed learning data records to JSON files
 * Creates timestamped JSON files that can be consumed by other modules
 */
@Component
public class LearningDataWriter implements ItemWriter<LearningDataRecord> {

    @Value("${app.output.json-folder:output}")
    private String outputFolder;

    private final ObjectMapper objectMapper;

    public LearningDataWriter() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.enable(SerializationFeature.INDENT_OUTPUT); // Pretty print JSON
        this.objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    @Override
    public void write(Chunk<? extends LearningDataRecord> chunk) throws Exception {
        System.out.println("🔥 WRITER CALLED - Chunk size: " + chunk.size());

        if (chunk.isEmpty()) {
            System.out.println("❌ No records to write in this chunk");
            return;
        }

        // Create timestamped filename
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss_SSS"));
        String filename = "learning_data_" + timestamp + ".json";

        // Ensure output directory exists
        File outputDir = new File(outputFolder);
        if (!outputDir.exists()) {
            outputDir.mkdirs();
        }

        File outputFile = new File(outputDir, filename);

        // Convert chunk to list for JSON serialization
        List<LearningDataRecord> records = new ArrayList<>();
        for (LearningDataRecord record : chunk) {
            records.add(record);
        }

        try {
            // Write JSON file
            objectMapper.writeValue(outputFile, records);

            System.out.println("======================================");
            System.out.println("Successfully wrote " + records.size() + " records to JSON file: " + filename);
            System.out.println("File path: " + outputFile.getAbsolutePath());
            System.out.println("File size: " + outputFile.length() + " bytes");

            // Log some basic stats
            logProcessingStats(records);

            System.out.println("JSON file ready for integration module consumption");
            System.out.println("======================================");

        } catch (IOException e) {
            System.err.println("Failed to write JSON file: " + filename);
            System.err.println("Error: " + e.getMessage());
            throw new RuntimeException("Failed to write learning data to JSON file", e);
        }
    }

    private void logProcessingStats(List<LearningDataRecord> records) {
        if (records.isEmpty()) {
            return;
        }

        // Basic statistics
        long uniqueUsers = records.stream()
                .map(LearningDataRecord::getEmail)
                .distinct()
                .count();

        long uniqueContent = records.stream()
                .map(LearningDataRecord::getNomeContenuto)
                .distinct()
                .count();

        long completedRecords = records.stream()
                .filter(r -> r.getPercentualeCompletamento() != null &&
                        r.getPercentualeCompletamentoAsDecimal().intValue() == 100)
                .count();

        System.out.println("Processing Statistics:");
        System.out.println("- Total records: " + records.size());
        System.out.println("- Unique users: " + uniqueUsers);
        System.out.println("- Unique content items: " + uniqueContent);
        System.out.println("- Completed courses: " + completedRecords);

        // Sample record for verification
        LearningDataRecord firstRecord = records.get(0);
        System.out.println("Sample record: " + firstRecord.getEmail() + " - " + firstRecord.getNomeContenuto());
    }
}