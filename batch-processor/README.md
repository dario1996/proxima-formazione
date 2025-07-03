# Batch Processor - LinkedIn Learning CSV Processor

This is a Spring Boot module with Spring Batch that processes LinkedIn Learning CSV files every hour. It's designed to extract learning data and prepare it for integration with the main application's database.

## Features

- **Scheduled Processing**: Automatically checks for CSV files every hour
- **CSV Parsing**: Processes LinkedIn Learning export files with 19 specific columns
- **Data Validation**: Validates and cleans incoming data
- **Error Handling**: Moves failed files to processed folder with error suffix
- **Data Transformation**: Prepares data for integration with existing entities

## CSV File Format

The processor expects CSV files with the following 19 columns:

| #   | Column Name                          | Data Type                    | Description                                     |
| --- | ------------------------------------ | ---------------------------- | ----------------------------------------------- |
| 1   | Nome                                 | String                       | Student name as registered in LinkedIn Learning |
| 2   | Email                                | String                       | User email address                              |
| 3   | ID utente univoco                    | String/UUID                  | Internal account identifier                     |
| 4   | Nome contenuto                       | String                       | Course, video or path title                     |
| 5   | Fornitore contenuto                  | String                       | Content provider (LinkedIn Learning, etc.)      |
| 6   | Tipo di contenuto                    | String                       | Course, Video, Learning Path...                 |
| 7   | ID contenuto                         | Integer                      | LinkedIn numeric code for course/video          |
| 8   | Ore di visione                       | Duration (hh:mm:ss)          | Total watch time                                |
| 9   | Percentuale di completamento         | Percentage                   | Completion percentage (0-100%)                  |
| 10  | Inizio (PST/PDT)                     | DateTime                     | First access timestamp (US Pacific timezone)    |
| 11  | Ultima visualizzazione (PST/PDT)     | DateTime                     | Last view event in extracted period             |
| 12  | Completamento (PST/PDT)              | DateTime                     | Course completion timestamp                     |
| 13  | Valutazioni totali                   | Integer                      | Number of ratings/feedback received             |
| 14  | Numero di valutazioni completate     | Integer                      | Number of ratings user completed                |
| 15  | Competenze                           | String (semicolon-separated) | Skills tags associated with content             |
| 16  | Nome corso (solo video di LinkedIn)  | String                       | Parent course title for LinkedIn videos         |
| 17  | ID corso (solo video di LinkedIn)    | Integer                      | Parent course ID                                |
| 18  | Gruppi (al momento dell'interazione) | String (list)                | LinkedIn groups during interaction              |
| 19  | Gruppi (iscrizioni attuali)          | String (list)                | Current LinkedIn group memberships              |

## Directory Structure

```
batch-processor/
├── input/          # Place CSV files here for processing
├── processed/      # Successfully processed files moved here
├── error/          # Failed processing files moved here (optional)
└── src/
    └── main/
        ├── java/
        │   └── com/example/batchprocessor/
        │       ├── BatchProcessorApplication.java
        │       ├── config/
        │       │   └── BatchConfiguration.java
        │       ├── model/
        │       │   └── LearningDataRecord.java
        │       ├── processor/
        │       │   └── LearningDataProcessor.java
        │       ├── scheduler/
        │       │   └── CsvProcessingScheduler.java
        │       ├── service/
        │       │   └── DataTransformationService.java
        │       └── writer/
        │           └── LearningDataWriter.java
        └── resources/
            └── application.yml
```

## Setup and Running

### Prerequisites

- Java 17+
- Maven 3.6+

### Build and Run

1. Navigate to the batch-processor directory:

```bash
cd batch-processor
```

2. Build the project:

```bash
mvn clean compile
```

3. Run the application:

```bash
mvn spring-boot:run
```

The application will:

- Start on port 8081
- Create `input` and `processed` directories if they don't exist
- Begin monitoring for CSV files every hour

### Configuration

Edit `src/main/resources/application.yml` to customize:

```yaml
app:
  csv:
    input-folder: input # Folder to monitor for CSV files
    processed-folder: processed # Folder for successfully processed files
    error-folder: error # Folder for failed processing files
```

## Usage

1. **Place CSV Files**: Drop LinkedIn Learning CSV export files into the `input/` folder
2. **Automatic Processing**: The scheduler runs every hour and processes all CSV files found
3. **Monitor Logs**: Check console output for processing status
4. **Check Results**: Successfully processed files are moved to `processed/` folder with timestamp

## Integration with Main Application

The `DataTransformationService` class provides methods to transform CSV data into formats compatible with your existing entities:

- **Dipendente**: Employee data (nome, cognome, email)
- **Corso**: Course data (nome, idContenutoLinkedin, durata)
- **Piattaforma**: Platform data (nome, descrizione)
- **Assegnazione**: Assignment data (percentualeCompletamento, oreCompletate, dates)

### Future Integration Steps

1. Add database dependencies to connect to the main application's database
2. Create repositories to persist transformed data
3. Implement data mapping between CSV records and existing entities
4. Add API endpoints to trigger manual processing or check status
5. Implement message queues for real-time integration

## Testing

To test the processor:

1. Create a sample CSV file with the required columns
2. Place it in the `input/` folder
3. Wait for the next scheduled run (or restart the application for immediate processing)
4. Check the console logs and `processed/` folder

## Troubleshooting

### Common Issues

1. **Files not processing**: Check that CSV files have the correct format and required columns
2. **Permission errors**: Ensure the application has read/write access to input and processed folders
3. **Memory issues**: For large CSV files, consider adjusting JVM heap size

### Logs

Check the application logs for detailed processing information:

- Processing status for each file
- Validation errors for individual records
- File movement operations
- Scheduling information

## Architecture

The batch processor follows Spring Batch best practices:

- **Reader**: `FlatFileItemReader` reads CSV files
- **Processor**: `LearningDataProcessor` validates and cleans data
- **Writer**: `LearningDataWriter` outputs processed data (currently to console)
- **Scheduler**: `CsvProcessingScheduler` triggers processing every hour
- **Service**: `DataTransformationService` prepares data for database integration
