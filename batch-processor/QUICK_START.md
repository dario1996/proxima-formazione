# Quick Start Guide - CSV Batch Processor

## Prerequisites

- Java 17 or later
- Maven 3.6 or later

## Quick Setup and Test

### 1. Start the Application

**Windows:**

```cmd
start-batch-processor.bat
```

**Linux/Mac:**

```bash
chmod +x start-batch-processor.sh
./start-batch-processor.sh
```

**Manual:**

```bash
cd batch-processor
mvn clean spring-boot:run
```

### 2. Test with Sample Data

1. Copy the sample CSV file to the input folder:

   ```bash
   cp sample-data/linkedin-learning-sample.csv input/
   ```

2. Wait for the next scheduled run (every hour) or restart the application to process immediately

3. Check the console logs for processing output

4. Verify the file was moved to the `processed/` folder

### 3. Expected Output

You should see console output like:

```
=== Starting scheduled CSV processing at 2024-01-23T10:00:00 ===
Found 1 CSV file(s) to process
Processing file: linkedin-learning-sample.csv
Processing record for: mario.rossi@example.com - Content: Introduction to Java Programming
Processing record for: anna.verdi@example.com - Content: Advanced Spring Boot
...
Successfully processed file: linkedin-learning-sample.csv
Moved file to processed folder: linkedin-learning-sample_20240123_100030.csv
=== Completed scheduled CSV processing at 2024-01-23T10:00:15 ===
```

### 4. Application Endpoints

- **Application**: http://localhost:8081
- **H2 Console**: http://localhost:8081/h2-console (for monitoring batch metadata)
  - JDBC URL: `jdbc:h2:mem:batchdb`
  - Username: `sa`
  - Password: (empty)

### 5. Folder Structure After Running

```
batch-processor/
├── input/                  # Empty (files processed and moved)
├── processed/             # Contains processed files with timestamps
│   └── linkedin-learning-sample_20240123_100030.csv
└── ...
```

## Adding Your Own CSV Files

1. Export data from LinkedIn Learning in the required format (19 columns)
2. Place CSV files in the `input/` folder
3. Files will be automatically processed every hour
4. Processed files are moved to `processed/` folder with timestamps

## Customization

Edit `src/main/resources/application.yml` to modify:

- Processing schedule (currently every hour)
- Input/output folder paths
- Database settings
- Logging levels

## Next Steps for Integration

1. **Database Integration**: Connect to your main application's database
2. **Entity Mapping**: Map CSV data to your existing Dipendente, Corso, Assegnazione entities
3. **API Integration**: Add REST endpoints for manual triggering and status monitoring
4. **Message Queues**: Implement asynchronous processing for real-time integration
5. **Monitoring**: Add metrics and health checks

## Troubleshooting

- **No files processing**: Ensure CSV files have correct format and are in `input/` folder
- **Permission errors**: Check read/write permissions on input/processed folders
- **Memory issues**: Increase JVM heap size with `-Xmx2g` for large files
- **Port conflicts**: Change server port in application.yml if 8081 is in use
