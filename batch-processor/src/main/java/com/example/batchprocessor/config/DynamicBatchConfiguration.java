package com.example.batchprocessor.config;

import com.example.batchprocessor.model.LearningDataRecord;
import com.example.batchprocessor.processor.LearningDataProcessor;
import com.example.batchprocessor.writer.LearningDataWriter;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.item.file.FlatFileItemReader;
import org.springframework.batch.item.file.builder.FlatFileItemReaderBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.FileSystemResource;
import org.springframework.transaction.PlatformTransactionManager;

@Configuration
public class DynamicBatchConfiguration {

        @Bean
        @StepScope
        public FlatFileItemReader<LearningDataRecord> dynamicReader(
                        @Value("#{jobParameters['inputFile']}") String inputFile) {

                String filePath = inputFile != null ? inputFile : "input/linkedin-learning-data.csv";

                System.out.println("🔍 CSV READER CONFIGURATION:");
                System.out.println("   File path: " + filePath);
                System.out.println("   File exists: " + new java.io.File(filePath).exists());
                System.out.println("   File absolute path: " + new java.io.File(filePath).getAbsolutePath());

                return new FlatFileItemReaderBuilder<LearningDataRecord>()
                                .name("learningDataReader")
                                .resource(new FileSystemResource(filePath))
                                .delimited()
                                .names("nome", "email", "idUtenteUnivoco", "nomeContenuto", "fornitoreContenuto",
                                                "tipoContenuto", "idContenuto", "oreVisione",
                                                "percentualeCompletamento",
                                                "inizioPstPdt", "ultimaVisualizzazionePstPdt", "completamentoPstPdt",
                                                "valutazioniTotali", "numeroValutazioniCompletate", "competenze",
                                                "nomeCorso", "idCorso", "gruppiMomentoInterazione",
                                                "gruppiIscrizioniAttuali")
                                .targetType(LearningDataRecord.class)
                                .linesToSkip(1) // Skip header row
                                .strict(true) // Enable strict mode to catch errors
                                .build();
        }

        @Bean
        public Job dynamicImportLearningDataJob(JobRepository jobRepository,
                        Step dynamicImportLearningDataStep) {
                return new JobBuilder("dynamicImportLearningDataJob", jobRepository)
                                .start(dynamicImportLearningDataStep)
                                .build();
        }

        @Bean
        public Step dynamicImportLearningDataStep(JobRepository jobRepository,
                        PlatformTransactionManager transactionManager,
                        FlatFileItemReader<LearningDataRecord> dynamicReader,
                        LearningDataProcessor processor,
                        LearningDataWriter writer) {
                return new StepBuilder("dynamicImportLearningDataStep", jobRepository)
                                .<LearningDataRecord, LearningDataRecord>chunk(100, transactionManager)
                                .reader(dynamicReader)
                                .processor(processor)
                                .writer(writer)
                                .faultTolerant()
                                .skipLimit(50) // Skip up to 50 invalid records
                                .skip(Exception.class)
                                .build();
        }
}