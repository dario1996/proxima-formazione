package com.example.dataprocessor.service;

import com.example.dataprocessor.entity.LearningDataRecord;
import com.example.dataprocessor.repository.LearningDataRepository;
import com.example.demo.entity.*;
import com.example.demo.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class StagingDataProcessingService {

    @Autowired
    private LearningDataRepository learningDataRepository;

    @Autowired
    private DipendenteRepository dipendenteRepository;

    @Autowired
    private PiattaformaRepository piattaformaRepository;

    @Autowired
    private CorsoRepository corsoRepository;

    @Autowired
    private AssegnazioneRepository assegnazioneRepository;

    @Value("${app.processing.chunk-size:100}")
    private int chunkSize;

    /**
     * Main method to process all unprocessed staging data
     */
    @Transactional
    public ProcessingSummary processAllStagingData() {
        log.info("Starting processing of staging data to business tables");

        ProcessingSummary summary = new ProcessingSummary();

        try {
            // Get all unprocessed records
            List<LearningDataRecord> unprocessedRecords = learningDataRepository.findByProcessedFalse();
            log.info("Found {} unprocessed records in staging", unprocessedRecords.size());

            // Process records in chunks
            for (int i = 0; i < unprocessedRecords.size(); i += chunkSize) {
                int endIndex = Math.min(i + chunkSize, unprocessedRecords.size());
                List<LearningDataRecord> chunk = unprocessedRecords.subList(i, endIndex);

                log.debug("Processing chunk {}-{} ({} records)", i + 1, endIndex, chunk.size());
                ProcessingSummary chunkSummary = processRecordChunk(chunk);
                summary.merge(chunkSummary);
            }

            log.info("Staging data processing completed. Summary: {}", summary);
            return summary;

        } catch (Exception e) {
            log.error("Error during staging data processing", e);
            throw new RuntimeException("Failed to process staging data", e);
        }
    }

    /**
     * Process a chunk of staging records - each record in its own transaction
     */
    public ProcessingSummary processRecordChunk(List<LearningDataRecord> records) {
        ProcessingSummary summary = new ProcessingSummary();

        for (LearningDataRecord record : records) {
            try {
                // Process each record in its own transaction to prevent one failure from
                // affecting others
                processRecordInTransaction(record);
                summary.incrementProcessed();

            } catch (Exception e) {
                log.error("Error processing record ID: {} - {}", record.getId(), e.getMessage());
                summary.incrementErrors();
            }
        }

        return summary;
    }

    /**
     * Process a single record in its own transaction
     */
    @Transactional
    public void processRecordInTransaction(LearningDataRecord record) {
        processRecord(record);

        // Mark record as processed
        record.setProcessed(true);
        learningDataRepository.save(record);
    }

    /**
     * Process a single staging record
     */
    @Transactional
    public void processRecord(LearningDataRecord record) {
        log.debug("Processing record: {} - {}", record.getEmail(), record.getContentName());

        // 1. Find or create employee
        Dipendente dipendente = findOrCreateDipendente(record);

        // 2. Find or create platform
        Piattaforma piattaforma = findOrCreatePiattaforma(record);

        // 3. Find or create course
        Corso corso = findOrCreateCorso(record, piattaforma);

        // 4. Create or update assignment
        createOrUpdateAssegnazione(record, dipendente, corso);

        log.debug("Successfully processed record for {} - {}", record.getEmail(), record.getContentName());
    }

    /**
     * Find or create employee from staging data
     */
    private Dipendente findOrCreateDipendente(LearningDataRecord record) {
        // Try to find existing employee by email first
        Optional<Dipendente> existing = dipendenteRepository.findByEmail(record.getEmail());

        if (existing.isPresent()) {
            log.debug("Found existing employee by email: {}", record.getEmail());
            return existing.get();
        }

        // Try to find existing employee by employee code
        if (record.getEmployeeId() != null && !record.getEmployeeId().trim().isEmpty()) {
            Optional<Dipendente> existingByCode = dipendenteRepository.findByCodiceDipendente(record.getEmployeeId());

            if (existingByCode.isPresent()) {
                log.debug("Found existing employee by code: {} (updating email to: {})",
                        record.getEmployeeId(), record.getEmail());

                // Update the existing employee's information if needed
                Dipendente existingEmployee = existingByCode.get();
                existingEmployee.setEmail(record.getEmail());
                existingEmployee.setNome(record.getFirstName());
                existingEmployee.setCognome(record.getLastName());

                existingEmployee = dipendenteRepository.save(existingEmployee);

                log.info("Updated existing employee: {} with new email: {}",
                        record.getEmployeeId(), record.getEmail());
                return existingEmployee;
            }
        }

        // Create new employee
        Dipendente dipendente = new Dipendente();
        dipendente.setEmail(record.getEmail());
        dipendente.setNome(record.getFirstName());
        dipendente.setCognome(record.getLastName());

        // Set employee ID if available
        if (record.getEmployeeId() != null && !record.getEmployeeId().trim().isEmpty()) {
            dipendente.setCodiceDipendente(record.getEmployeeId());
        }

        dipendente.setAttivo(true);
        dipendente = dipendenteRepository.save(dipendente);

        log.info("Created new employee: {} (ID: {})", dipendente.getEmail(), dipendente.getId());
        return dipendente;
    }

    /**
     * Find or create platform from staging data
     */
    private Piattaforma findOrCreatePiattaforma(LearningDataRecord record) {
        String platformName = record.getProvider() != null ? record.getProvider() : "LinkedIn Learning";

        Optional<Piattaforma> existing = piattaformaRepository.findByNomeIgnoreCase(platformName);

        if (existing.isPresent()) {
            log.debug("Found existing platform: {}", platformName);
            return existing.get();
        }

        // Create new platform
        Piattaforma piattaforma = new Piattaforma();
        piattaforma.setNome(platformName);
        piattaforma.setDescrizione("Platform for online learning courses");
        piattaforma.setAttiva(true);
        piattaforma = piattaformaRepository.save(piattaforma);

        log.info("Created new platform: {} (ID: {})", piattaforma.getNome(), piattaforma.getId());
        return piattaforma;
    }

    /**
     * Find or create course from staging data
     */
    private Corso findOrCreateCorso(LearningDataRecord record, Piattaforma piattaforma) {
        // Try to find by LinkedIn content ID first
        Optional<Corso> existing = Optional.empty();
        if (record.getContentId() != null && !record.getContentId().trim().isEmpty()) {
            existing = corsoRepository.findByIdContenutoLinkedin(record.getContentId());
        }

        // If not found, try by name and platform
        if (existing.isEmpty()) {
            existing = corsoRepository.findByNomeAndPiattaforma(record.getContentName(), piattaforma);
        }

        if (existing.isPresent()) {
            log.debug("Found existing course: {}", record.getContentName());
            return existing.get();
        }

        // Create new course
        Corso corso = new Corso();
        corso.setNome(record.getContentName());
        corso.setPiattaforma(piattaforma);

        // Set LinkedIn content ID if available
        if (record.getContentId() != null && !record.getContentId().trim().isEmpty()) {
            corso.setIdContenutoLinkedin(record.getContentId());
        }

        // Set course URL if available
        if (record.getCourseUrl() != null && !record.getCourseUrl().trim().isEmpty()) {
            corso.setUrlCorso(record.getCourseUrl());
        }

        // Set content type as category
        if (record.getContentType() != null && !record.getContentType().trim().isEmpty()) {
            corso.setCategoria(record.getContentType());
        }

        // Calculate duration from time viewed (convert seconds to hours)
        if (record.getTimeViewedSeconds() != null && record.getTimeViewedSeconds() > 0) {
            BigDecimal hours = BigDecimal.valueOf(record.getTimeViewedSeconds())
                    .divide(BigDecimal.valueOf(3600), 2, RoundingMode.HALF_UP);
            corso.setDurata(hours);
            corso.setOre(hours);
        }

        corso.setStato(Corso.StatoCorso.PIANIFICATO);
        corso = corsoRepository.save(corso);

        log.info("Created new course: {} (ID: {})", corso.getNome(), corso.getId());
        return corso;
    }

    /**
     * Create or update assignment from staging data
     */
    private void createOrUpdateAssegnazione(LearningDataRecord record, Dipendente dipendente, Corso corso) {
        Optional<Assegnazione> existing = assegnazioneRepository.findByDipendenteAndCorso(dipendente, corso);

        Assegnazione assegnazione;
        if (existing.isPresent()) {
            assegnazione = existing.get();
            log.debug("Updating existing assignment: {} - {}", dipendente.getEmail(), corso.getNome());
        } else {
            assegnazione = new Assegnazione();
            assegnazione.setDipendente(dipendente);
            assegnazione.setCorso(corso);
            assegnazione.setDataAssegnazione(LocalDate.now());
            log.debug("Creating new assignment: {} - {}", dipendente.getEmail(), corso.getNome());
        }

        // Update assignment data from learning record
        if (record.getPercentageComplete() != null) {
            assegnazione.setPercentualeCompletamento(record.getPercentageComplete());

            // If 100% complete, mark as completed
            if (record.getPercentageComplete().compareTo(BigDecimal.valueOf(100)) >= 0) {
                assegnazione.setStato(Assegnazione.StatoAssegnazione.COMPLETATO);
                if (record.getCompletionDate() != null) {
                    assegnazione.setDataCompletamento(record.getCompletionDate());
                }
            } else if (record.getPercentageComplete().compareTo(BigDecimal.ZERO) > 0) {
                assegnazione.setStato(Assegnazione.StatoAssegnazione.IN_CORSO);
            }
        }

        // Set hours completed from time viewed
        if (record.getTimeViewedSeconds() != null && record.getTimeViewedSeconds() > 0) {
            BigDecimal hours = BigDecimal.valueOf(record.getTimeViewedSeconds())
                    .divide(BigDecimal.valueOf(3600), 2, RoundingMode.HALF_UP);
            assegnazione.setOreCompletate(hours);
        }

        // Set rating if available
        if (record.getRating() != null) {
            assegnazione.setValutazione(record.getRating());
            assegnazione.setFeedbackFornito(true);
        }

        // Set skills as acquired competencies
        if (record.getSkills() != null && !record.getSkills().trim().isEmpty()) {
            assegnazione.setCompetenzeAcquisite(record.getSkills());
        }

        // Mark as completed if completion date is set
        if (record.getCompletionDate() != null) {
            assegnazione.setDataCompletamento(record.getCompletionDate());
            assegnazione.setStato(Assegnazione.StatoAssegnazione.COMPLETATO);
            assegnazione.setCertificatoOttenuto(true);
        }

        assegnazioneRepository.save(assegnazione);
        log.debug("Saved assignment: {} - {}", dipendente.getEmail(), corso.getNome());
    }

    /**
     * Get processing statistics
     */
    public ProcessingStats getProcessingStats() {
        ProcessingStats stats = new ProcessingStats();

        stats.setTotalStagingRecords(learningDataRepository.count());
        stats.setProcessedRecords(learningDataRepository.countByProcessedTrue());
        stats.setUnprocessedRecords(learningDataRepository.countByProcessedFalse());
        stats.setTotalEmployees(dipendenteRepository.count());
        stats.setTotalCourses(corsoRepository.count());
        stats.setTotalAssignments(assegnazioneRepository.count());

        return stats;
    }

    // Helper classes
    public static class ProcessingSummary {
        private int processed = 0;
        private int errors = 0;

        public void incrementProcessed() {
            processed++;
        }

        public void incrementErrors() {
            errors++;
        }

        public void merge(ProcessingSummary other) {
            this.processed += other.processed;
            this.errors += other.errors;
        }

        public int getProcessed() {
            return processed;
        }

        public int getErrors() {
            return errors;
        }

        public int getTotal() {
            return processed + errors;
        }

        @Override
        public String toString() {
            return String.format("Processed: %d, Errors: %d, Total: %d", processed, errors, getTotal());
        }
    }

    public static class ProcessingStats {
        private long totalStagingRecords;
        private long processedRecords;
        private long unprocessedRecords;
        private long totalEmployees;
        private long totalCourses;
        private long totalAssignments;

        // Getters and setters
        public long getTotalStagingRecords() {
            return totalStagingRecords;
        }

        public void setTotalStagingRecords(long totalStagingRecords) {
            this.totalStagingRecords = totalStagingRecords;
        }

        public long getProcessedRecords() {
            return processedRecords;
        }

        public void setProcessedRecords(long processedRecords) {
            this.processedRecords = processedRecords;
        }

        public long getUnprocessedRecords() {
            return unprocessedRecords;
        }

        public void setUnprocessedRecords(long unprocessedRecords) {
            this.unprocessedRecords = unprocessedRecords;
        }

        public long getTotalEmployees() {
            return totalEmployees;
        }

        public void setTotalEmployees(long totalEmployees) {
            this.totalEmployees = totalEmployees;
        }

        public long getTotalCourses() {
            return totalCourses;
        }

        public void setTotalCourses(long totalCourses) {
            this.totalCourses = totalCourses;
        }

        public long getTotalAssignments() {
            return totalAssignments;
        }

        public void setTotalAssignments(long totalAssignments) {
            this.totalAssignments = totalAssignments;
        }

        @Override
        public String toString() {
            return String.format("Staging: %d/%d processed, Business: %d employees, %d courses, %d assignments",
                    processedRecords, totalStagingRecords, totalEmployees, totalCourses, totalAssignments);
        }
    }
}