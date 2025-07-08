package com.example.dataprocessor.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private Json json = new Json();
    private Processing processing = new Processing();

    public Json getJson() {
        return json;
    }

    public void setJson(Json json) {
        this.json = json;
    }

    public Processing getProcessing() {
        return processing;
    }

    public void setProcessing(Processing processing) {
        this.processing = processing;
    }

    public static class Json {
        private String inputFolder = "../batch-processor/output";
        private String processedFolder = "processed";
        private String errorFolder = "error";

        public String getInputFolder() {
            return inputFolder;
        }

        public void setInputFolder(String inputFolder) {
            this.inputFolder = inputFolder;
        }

        public String getProcessedFolder() {
            return processedFolder;
        }

        public void setProcessedFolder(String processedFolder) {
            this.processedFolder = processedFolder;
        }

        public String getErrorFolder() {
            return errorFolder;
        }

        public void setErrorFolder(String errorFolder) {
            this.errorFolder = errorFolder;
        }
    }

    public static class Processing {
        private int chunkSize = 100;
        private int maxRetryAttempts = 3;
        private boolean enabled = true;
        private long interval = 60000;
        private long schedulerInterval = 30000;

        public int getChunkSize() {
            return chunkSize;
        }

        public void setChunkSize(int chunkSize) {
            this.chunkSize = chunkSize;
        }

        public int getMaxRetryAttempts() {
            return maxRetryAttempts;
        }

        public void setMaxRetryAttempts(int maxRetryAttempts) {
            this.maxRetryAttempts = maxRetryAttempts;
        }

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }

        public long getInterval() {
            return interval;
        }

        public void setInterval(long interval) {
            this.interval = interval;
        }

        public long getSchedulerInterval() {
            return schedulerInterval;
        }

        public void setSchedulerInterval(long schedulerInterval) {
            this.schedulerInterval = schedulerInterval;
        }
    }
}