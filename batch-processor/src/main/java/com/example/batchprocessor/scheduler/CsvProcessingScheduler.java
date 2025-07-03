package com.example.batchprocessor.scheduler;

import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.File;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Scheduler that monitors the input folder and processes CSV files every hour
 */
@Component
public class CsvProcessingScheduler {

    @Autowired
    private JobLauncher jobLauncher;

    @Autowired
    private Job dynamicImportLearningDataJob;

    private static final String INPUT_FOLDER = "input";
    private static final String PROCESSED_FOLDER = "processed";

    @Scheduled(fixedRate = 3600000) // Run every hour (3600000 ms = 1 hour)
    public void processCSVFiles() {
        System.out.println("=== Starting scheduled CSV processing at " + LocalDateTime.now() + " ===");

        try {
            File inputDir = new File(INPUT_FOLDER);

            // Create directories if they don't exist
            if (!inputDir.exists()) {
                inputDir.mkdirs();
                System.out.println("Created input directory: " + inputDir.getAbsolutePath());
            }

            File processedDir = new File(PROCESSED_FOLDER);
            if (!processedDir.exists()) {
                processedDir.mkdirs();
                System.out.println("Created processed directory: " + processedDir.getAbsolutePath());
            }

            // Look for CSV files in the input folder
            File[] csvFiles = inputDir.listFiles((dir, name) -> name.toLowerCase().endsWith(".csv"));

            if (csvFiles == null || csvFiles.length == 0) {
                System.out.println("No CSV files found in input folder: " + inputDir.getAbsolutePath());
                return;
            }

            System.out.println("Found " + csvFiles.length + " CSV file(s) to process");

            for (File csvFile : csvFiles) {
                try {
                    processFile(csvFile);
                    moveToProcessed(csvFile);
                } catch (Exception e) {
                    System.err.println("Error processing file " + csvFile.getName() + ": " + e.getMessage());
                    e.printStackTrace();
                    // Move failed files to a different location or add error suffix
                    moveToProcessed(csvFile, "_ERROR");
                }
            }

        } catch (Exception e) {
            System.err.println("Error during scheduled CSV processing: " + e.getMessage());
            e.printStackTrace();
        }

        System.out.println("=== Completed scheduled CSV processing at " + LocalDateTime.now() + " ===");
    }

    private void processFile(File csvFile) throws Exception {
        System.out.println("Processing file: " + csvFile.getName());

        // Create unique job parameters to allow multiple executions
        JobParameters jobParameters = new JobParametersBuilder()
                .addString("inputFile", csvFile.getAbsolutePath())
                .addString("fileName", csvFile.getName())
                .addLong("timestamp", System.currentTimeMillis())
                .toJobParameters();

        jobLauncher.run(dynamicImportLearningDataJob, jobParameters);

        System.out.println("Successfully processed file: " + csvFile.getName());
    }

    private void moveToProcessed(File csvFile) {
        moveToProcessed(csvFile, "");
    }

    private void moveToProcessed(File csvFile, String suffix) {
        try {
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String newFileName = csvFile.getName().replace(".csv", suffix + "_" + timestamp + ".csv");
            File processedFile = new File(PROCESSED_FOLDER, newFileName);

            if (csvFile.renameTo(processedFile)) {
                System.out.println("Moved file to processed folder: " + processedFile.getName());
            } else {
                System.err.println("Failed to move file to processed folder: " + csvFile.getName());
            }
        } catch (Exception e) {
            System.err.println("Error moving file to processed folder: " + e.getMessage());
        }
    }
}