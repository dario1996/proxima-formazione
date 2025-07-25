package com.example.batchprocessor.config;

import com.example.batchprocessor.model.LearningDataRecord;
import com.example.batchprocessor.processor.LearningDataProcessor;
import com.example.batchprocessor.writer.LearningDataWriter;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.item.file.FlatFileItemReader;
import org.springframework.batch.item.file.builder.FlatFileItemReaderBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.FileSystemResource;
import org.springframework.transaction.PlatformTransactionManager;

@Configuration
public class BatchConfiguration {

    @Bean
    public FlatFileItemReader<LearningDataRecord> reader() {
        return new FlatFileItemReaderBuilder<LearningDataRecord>()
                .name("learningDataReader")
                .resource(new FileSystemResource("input/linkedin-learning-data.csv"))
                .delimited()
                .names("nome", "email", "idUtenteUnivoco", "nomeContenuto", "fornitoreContenuto",
                        "tipoContenuto", "idContenuto", "oreVisione", "percentualeCompletamento",
                        "inizioPstPdt", "ultimaVisualizzazionePstPdt", "completamentoPstPdt",
                        "valutazioniTotali", "numeroValutazioniCompletate", "competenze",
                        "nomeCorso", "idCorso", "gruppiMomentoInterazione", "gruppiIscrizioniAttuali")
                .targetType(LearningDataRecord.class)
                .linesToSkip(1) // Skip header row
                .build();
    }

    @Bean
    public LearningDataProcessor processor() {
        return new LearningDataProcessor();
    }

    @Bean
    public LearningDataWriter writer() {
        return new LearningDataWriter();
    }

    @Bean
    public Job importLearningDataJob(JobRepository jobRepository,
            Step importLearningDataStep) {
        return new JobBuilder("importLearningDataJob", jobRepository)
                .start(importLearningDataStep)
                .build();
    }

    @Bean
    public Step importLearningDataStep(JobRepository jobRepository,
            PlatformTransactionManager transactionManager,
            FlatFileItemReader<LearningDataRecord> reader,
            LearningDataProcessor processor,
            LearningDataWriter writer) {
        return new StepBuilder("importLearningDataStep", jobRepository)
                .<LearningDataRecord, LearningDataRecord>chunk(100, transactionManager)
                .reader(reader)
                .processor(processor)
                .writer(writer)
                .build();
    }
}