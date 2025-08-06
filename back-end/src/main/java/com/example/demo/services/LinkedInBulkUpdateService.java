package com.example.demo.services;

import com.example.demo.dto.LinkedInBulkUpdateRequest;
import com.example.demo.dto.LinkedInBulkUpdateResponse;
import com.example.demo.dto.LinkedInBulkUpdateItem;
import com.example.demo.entity.Assegnazione;
import com.example.demo.entity.Corso;
import com.example.demo.entity.Dipendente;
import com.example.demo.entity.Piattaforma;
import com.example.demo.repository.AssegnazioneRepository;
import com.example.demo.repository.CorsoRepository;
import com.example.demo.repository.DipendenteRepository;
import com.example.demo.repository.PiattaformaRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class LinkedInBulkUpdateService {

    @Autowired
    private AssegnazioneRepository assegnazioneRepository;
    
    @Autowired
    private DipendenteRepository dipendenteRepository;
    
    @Autowired
    private CorsoRepository corsoRepository;
    
    @Autowired
    private PiattaformaRepository piattaformaRepository;

    @Transactional
    public LinkedInBulkUpdateResponse updateFromLinkedIn(LinkedInBulkUpdateRequest request) {
        long startTime = System.currentTimeMillis();
        
        List<LinkedInBulkUpdateItem> items = request.getAssegnazioni();
        LinkedInBulkUpdateResponse response = new LinkedInBulkUpdateResponse();
        
        // Inizializza contatori
        response.setTotalProcessed(items.size());
        response.setErrors(new ArrayList<>());
        response.setProcessedItems(new ArrayList<>());
        
        int successCount = 0;
        int createdCount = 0;
        int updatedCount = 0;
        int coursesCreatedCount = 0;
        int errorCount = 0;

        // Pre-carica dati per ottimizzazione
        Map<String, Dipendente> dipendentiByEmail = loadDipendentiByEmailMap();
        Map<String, Corso> corsiByLinkedinId = loadCorsiByLinkedinIdMap();
        Map<String, Corso> corsiByNome = loadCorsiByNomeMap();
        
        // Statistiche
        Set<String> uniqueEmployees = new HashSet<>();
        Set<String> uniqueCourses = new HashSet<>();
        double totalCompletionPercentage = 0;
        double totalHours = 0;
        int fullyCompleted = 0;

        for (int i = 0; i < items.size(); i++) {
            LinkedInBulkUpdateItem item = items.get(i);
            int rowNumber = i + 2; // +2 perché Excel inizia da 1 e abbiamo header

            try {
                // Valida l'item LinkedIn
                List<String> validationErrors = validateLinkedInItem(item, dipendentiByEmail);
                
                if (!validationErrors.isEmpty()) {
                    errorCount++;
                    for (String error : validationErrors) {
                        response.getErrors().add(new LinkedInBulkUpdateResponse.LinkedInUpdateError(
                                rowNumber, item.getEmailDipendente(), item.getCorso(), 
                                item.getLinkedinContentId(), error, "VALIDATION"));
                    }
                    continue;
                }

                // Processa l'item LinkedIn
                ProcessResult result = processLinkedInItem(item, dipendentiByEmail, 
                                                         corsiByLinkedinId, corsiByNome, 
                                                         request.getOptions());
                
                if (result.isError()) {
                    errorCount++;
                    response.getErrors().add(new LinkedInBulkUpdateResponse.LinkedInUpdateError(
                            rowNumber, item.getEmailDipendente(), item.getCorso(),
                            item.getLinkedinContentId(), result.getErrorMessage(), "PROCESSING"));
                } else {
                    if (result.isCreated()) {
                        createdCount++;
                    } else if (result.isUpdated()) {
                        updatedCount++;
                    }
                    
                    if (result.isCourseCreated()) {
                        coursesCreatedCount++;
                    }
                    
                    successCount++;
                    response.getProcessedItems().add(item);
                    
                    // Accumula statistiche
                    uniqueEmployees.add(item.getEmailDipendente());
                    uniqueCourses.add(item.getLinkedinContentId());
                    
                    if (item.getPercentualeCompletamento() != null && !item.getPercentualeCompletamento().isEmpty()) {
                        try {
                            int percentage = Integer.parseInt(item.getPercentualeCompletamento().replace("%", "").trim());
                            totalCompletionPercentage += percentage;
                            if (percentage == 100) fullyCompleted++;
                        } catch (NumberFormatException ignored) {}
                    }
                    
                    if (item.getOreVisione() != null && !item.getOreVisione().isEmpty()) {
                        BigDecimal hours = parseLinkedInHours(item.getOreVisione());
                        if (hours != null) totalHours += hours.doubleValue();
                    }
                }

            } catch (Exception e) {
                errorCount++;
                log.error("Errore inaspettato durante il processamento LinkedIn riga {}", rowNumber, e);
                response.getErrors().add(new LinkedInBulkUpdateResponse.LinkedInUpdateError(
                        rowNumber, item.getEmailDipendente(), item.getCorso(),
                        item.getLinkedinContentId(), "Errore inaspettato: " + e.getMessage(), "SYSTEM"));
            }
        }

        // Imposta risultati
        response.setSuccessCount(successCount);
        response.setCreatedCount(createdCount);
        response.setUpdatedCount(updatedCount);
        response.setCoursesCreatedCount(coursesCreatedCount);
        response.setErrorCount(errorCount);
        
        // Calcola statistiche
        LinkedInBulkUpdateResponse.LinkedInUpdateStats stats = new LinkedInBulkUpdateResponse.LinkedInUpdateStats();
        stats.setUniqueEmployees(uniqueEmployees.size());
        stats.setUniqueCourses(uniqueCourses.size());
        stats.setAverageCompletionPercentage(successCount > 0 ? totalCompletionPercentage / successCount : 0);
        stats.setTotalTrainingHours(totalHours);
        stats.setProcessingTimeMs(System.currentTimeMillis() - startTime);
        stats.setFullyCompletedCourses(fullyCompleted);
        response.setStats(stats);
        
        log.info("LinkedIn update completed: {} success ({} created, {} updated), {} courses created, {} errors in {}ms", 
                 successCount, createdCount, updatedCount, coursesCreatedCount, errorCount, stats.getProcessingTimeMs());
        
        return response;
    }

    private Map<String, Dipendente> loadDipendentiByEmailMap() {
        return dipendenteRepository.findAll().stream()
                .filter(d -> d.getEmail() != null && !d.getEmail().trim().isEmpty())
                .collect(Collectors.toMap(
                        d -> d.getEmail().trim().toLowerCase(),
                        d -> d,
                        (existing, replacement) -> existing
                ));
    }

    private Map<String, Corso> loadCorsiByLinkedinIdMap() {
        return corsoRepository.findAll().stream()
                .filter(c -> c.getIdContenutoLinkedin() != null && !c.getIdContenutoLinkedin().trim().isEmpty())
                .collect(Collectors.toMap(
                        c -> c.getIdContenutoLinkedin().trim(),
                        c -> c,
                        (existing, replacement) -> existing
                ));
    }

    private Map<String, Corso> loadCorsiByNomeMap() {
        return corsoRepository.findAll().stream()
                .filter(c -> c.getNome() != null && !c.getNome().trim().isEmpty())
                .collect(Collectors.toMap(
                        c -> c.getNome().trim().toLowerCase(),
                        c -> c,
                        (existing, replacement) -> existing
                ));
    }

    private List<String> validateLinkedInItem(LinkedInBulkUpdateItem item, Map<String, Dipendente> dipendentiByEmail) {
        List<String> errors = new ArrayList<>();

        // Valida email dipendente
        if (item.getEmailDipendente() == null || item.getEmailDipendente().trim().isEmpty()) {
            errors.add("Email dipendente è obbligatoria");
        } else if (!dipendentiByEmail.containsKey(item.getEmailDipendente().trim().toLowerCase())) {
            errors.add("Dipendente non trovato con email: " + item.getEmailDipendente());
        }

        // Valida nome contenuto
        if (item.getCorso() == null || item.getCorso().trim().isEmpty()) {
            errors.add("Nome contenuto è obbligatorio");
        }

        // Valida ID contenuto LinkedIn
        if (item.getLinkedinContentId() == null || item.getLinkedinContentId().trim().isEmpty()) {
            errors.add("ID contenuto LinkedIn è obbligatorio");
        }

        return errors;
    }

    private ProcessResult processLinkedInItem(LinkedInBulkUpdateItem item,
                                            Map<String, Dipendente> dipendentiByEmail,
                                            Map<String, Corso> corsiByLinkedinId,
                                            Map<String, Corso> corsiByNome,
                                            LinkedInBulkUpdateRequest.LinkedInImportOptions options) {
        
        try {
            // Trova dipendente
            Dipendente dipendente = dipendentiByEmail.get(item.getEmailDipendente().trim().toLowerCase());
            
            // Trova o crea corso
            Corso corso = findOrCreateCourse(item, corsiByLinkedinId, corsiByNome, options);
            boolean courseCreated = !corsiByLinkedinId.containsKey(item.getLinkedinContentId()) && 
                                   !corsiByNome.containsKey(item.getCorso().toLowerCase());
            
            // Aggiorna mappe se corso creato
            if (courseCreated) {
                corsiByLinkedinId.put(item.getLinkedinContentId(), corso);
                corsiByNome.put(corso.getNome().toLowerCase(), corso);
            }

            // Trova o crea assegnazione
            Optional<Assegnazione> existingAssegnazione = assegnazioneRepository
                    .findByDipendenteIdAndCorsoId(dipendente.getId(), corso.getId());

            if (existingAssegnazione.isPresent()) {
                // Aggiorna assegnazione esistente
                Assegnazione assegnazione = existingAssegnazione.get();
                updateAssegnazioneFromLinkedIn(assegnazione, item);
                assegnazioneRepository.save(assegnazione);
                
                return ProcessResult.updated(courseCreated);
            } else {
                // Crea nuova assegnazione
                Assegnazione assegnazione = createAssegnazioneFromLinkedIn(item, dipendente, corso);
                assegnazioneRepository.save(assegnazione);
                
                return ProcessResult.created(courseCreated);
            }
            
        } catch (Exception e) {
            log.error("Errore durante il processamento LinkedIn item", e);
            return ProcessResult.error("Errore durante il processamento: " + e.getMessage());
        }
    }

    private Corso findOrCreateCourse(LinkedInBulkUpdateItem item,
                                   Map<String, Corso> corsiByLinkedinId,
                                   Map<String, Corso> corsiByNome,
                                   LinkedInBulkUpdateRequest.LinkedInImportOptions options) {
        
        // Cerca per LinkedIn Content ID
        if (corsiByLinkedinId.containsKey(item.getLinkedinContentId())) {
            return corsiByLinkedinId.get(item.getLinkedinContentId());
        }
        
        // Cerca per nome
        if (corsiByNome.containsKey(item.getCorso().toLowerCase())) {
            Corso corso = corsiByNome.get(item.getCorso().toLowerCase());
            // Aggiorna con LinkedIn ID se non ce l'ha
            if (corso.getIdContenutoLinkedin() == null) {
                corso.setIdContenutoLinkedin(item.getLinkedinContentId());
                corsoRepository.save(corso);
            }
            return corso;
        }
        
        // Crea nuovo corso se abilitato
        if (options.isCreateMissingCourses()) {
            return createLinkedInCourse(item);
        }
        
        throw new RuntimeException("Corso non trovato e creazione automatica disabilitata: " + item.getCorso());
    }

    private Corso createLinkedInCourse(LinkedInBulkUpdateItem item) {
        // Trova o crea piattaforma LinkedIn
        List<Piattaforma> linkedinPlatform = piattaformaRepository
                .findByNomeContainingIgnoreCase("LinkedIn Learning");

        if (linkedinPlatform.isEmpty()) {
            Piattaforma platform = new Piattaforma();
            platform.setNome("LinkedIn Learning");
            platform.setDescrizione("Piattaforma LinkedIn Learning");
            linkedinPlatform = List.of(piattaformaRepository.save(platform));
        }

        Corso corso = new Corso();
        corso.setNome(item.getCorso().trim());
        corso.setPiattaforma(linkedinPlatform.get(0));
        corso.setIdContenutoLinkedin(item.getLinkedinContentId().trim());
        corso.setStato(Corso.StatoCorso.ATTIVO);
        corso.setArgomento("LinkedIn Learning");
        corso.setCategoria(item.getTipoContenuto() != null ? item.getTipoContenuto() : "Online");
        corso.setDurata(BigDecimal.ZERO);
        corso.setCertificazioneRilasciata(true);
        corso.setFeedbackRichiesto(false);

        corso = corsoRepository.save(corso);
        log.info("Creato nuovo corso LinkedIn: '{}' con LinkedIn Content ID: {}", 
                corso.getNome(), corso.getIdContenutoLinkedin());
        
        return corso;
    }

    private void updateAssegnazioneFromLinkedIn(Assegnazione assegnazione, LinkedInBulkUpdateItem item) {
        // Aggiorna percentuale completamento
        if (item.getPercentualeCompletamento() != null && !item.getPercentualeCompletamento().isEmpty()) {
            try {
                int percentage = Integer.parseInt(item.getPercentualeCompletamento().replace("%", "").trim());
                assegnazione.setPercentualeCompletamento(new BigDecimal(percentage));
                
                // Aggiorna stato
                if (percentage == 100) {
                    assegnazione.setStato(Assegnazione.StatoAssegnazione.TERMINATO);
                    assegnazione.setCertificatoOttenuto(true);
                } else if (percentage > 0) {
                    assegnazione.setStato(Assegnazione.StatoAssegnazione.IN_CORSO);
                }
            } catch (NumberFormatException e) {
                log.warn("Formato percentuale non valido: {}", item.getPercentualeCompletamento());
            }
        }

        // Aggiorna ore di visione
        if (item.getOreVisione() != null && !item.getOreVisione().isEmpty()) {
            BigDecimal ore = parseLinkedInHours(item.getOreVisione());
            if (ore != null) {
                assegnazione.setOreCompletate(ore);
            }
        }

        // Aggiorna competenze
        if (item.getCompetenze() != null && !item.getCompetenze().trim().isEmpty()) {
            assegnazione.setCompetenzeAcquisite(item.getCompetenze().trim());
        }

        // Aggiorna date
        if (item.getDataInizio() != null && !item.getDataInizio().trim().isEmpty()) {
            LocalDate dataInizio = parseLinkedInDate(item.getDataInizio());
            if (dataInizio != null) assegnazione.setDataInizio(dataInizio);
        }

        if (item.getDataCompletamento() != null && !item.getDataCompletamento().trim().isEmpty()) {
            LocalDate dataCompletamento = parseLinkedInDate(item.getDataCompletamento());
            if (dataCompletamento != null) assegnazione.setDataCompletamento(dataCompletamento);
        }

        // Marca fonte
        assegnazione.setFonteRichiesta("LinkedIn Learning");
    }

    private Assegnazione createAssegnazioneFromLinkedIn(LinkedInBulkUpdateItem item, Dipendente dipendente, Corso corso) {
        Assegnazione assegnazione = new Assegnazione();
        assegnazione.setDipendente(dipendente);
        assegnazione.setCorso(corso);
        assegnazione.setDataAssegnazione(LocalDate.now());
        assegnazione.setObbligatorio(false);
        assegnazione.setFonteRichiesta("LinkedIn Learning");
        
        updateAssegnazioneFromLinkedIn(assegnazione, item);
        return assegnazione;
    }

    private BigDecimal parseLinkedInHours(String timeString) {
        if (timeString == null || timeString.trim().isEmpty()) return null;
        
        try {
            String cleaned = timeString.trim().toLowerCase();
            
            if (cleaned.contains("h") || cleaned.contains("m")) {
                double totalMinutes = 0;
                if (cleaned.contains("h")) {
                    String[] parts = cleaned.split("h");
                    totalMinutes += Double.parseDouble(parts[0].trim()) * 60;
                    if (parts.length > 1 && parts[1].contains("m")) {
                        String minutePart = parts[1].replace("m", "").trim();
                        if (!minutePart.isEmpty()) {
                            totalMinutes += Double.parseDouble(minutePart);
                        }
                    }
                } else if (cleaned.contains("m")) {
                    totalMinutes = Double.parseDouble(cleaned.replace("m", "").trim());
                }
                return new BigDecimal(totalMinutes / 60.0).setScale(2, RoundingMode.HALF_UP);
            }
        } catch (Exception e) {
            log.warn("Errore parsing ore LinkedIn: {}", timeString, e);
        }
        return null;
    }

    private LocalDate parseLinkedInDate(String dateString) {
        if (dateString == null || dateString.trim().isEmpty()) return null;
        
        try {
            String[] parts = dateString.split(" ");
            if (parts.length > 0) {
                String datePart = parts[0];
                String[] dateParts = datePart.split("/");
                if (dateParts.length == 3) {
                    int day = Integer.parseInt(dateParts[0]);
                    int month = Integer.parseInt(dateParts[1]);
                    int year = Integer.parseInt(dateParts[2]);
                    
                    if (year < 50) year += 2000;
                    else if (year < 100) year += 1900;
                    
                    return LocalDate.of(year, month, day);
                }
            }
        } catch (Exception e) {
            log.warn("Errore parsing data LinkedIn: {}", dateString, e);
        }
        return null;
    }

    // Classe helper per risultati
    private static class ProcessResult {
        private final boolean error;
        private final boolean created;
        private final boolean updated;
        private final boolean courseCreated;
        private final String errorMessage;
        
        private ProcessResult(boolean error, boolean created, boolean updated, boolean courseCreated, String errorMessage) {
            this.error = error;
            this.created = created;
            this.updated = updated;
            this.courseCreated = courseCreated;
            this.errorMessage = errorMessage;
        }
        
        public static ProcessResult created(boolean courseCreated) { 
            return new ProcessResult(false, true, false, courseCreated, null); 
        }
        
        public static ProcessResult updated(boolean courseCreated) { 
            return new ProcessResult(false, false, true, courseCreated, null); 
        }
        
        public static ProcessResult error(String message) { 
            return new ProcessResult(true, false, false, false, message); 
        }
        
        public boolean isError() { return error; }
        public boolean isCreated() { return created; }
        public boolean isUpdated() { return updated; }
        public boolean isCourseCreated() { return courseCreated; }
        public String getErrorMessage() { return errorMessage; }
    }
}