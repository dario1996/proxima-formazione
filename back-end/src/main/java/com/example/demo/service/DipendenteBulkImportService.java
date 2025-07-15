package com.example.demo.service;

import com.example.demo.dto.DipendenteBulkImportItem;
import com.example.demo.dto.DipendenteBulkImportRequest;
import com.example.demo.dto.DipendenteBulkImportResponse;
import com.example.demo.entity.Dipendente;
import com.example.demo.repository.DipendenteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class DipendenteBulkImportService {

    private static final Logger logger = LoggerFactory.getLogger(DipendenteBulkImportService.class);
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    private static final DateTimeFormatter[] DATE_FORMATTERS = {
            DateTimeFormatter.ofPattern("yyyy-MM-dd"),
            DateTimeFormatter.ofPattern("dd/MM/yyyy"),
            DateTimeFormatter.ofPattern("dd-MM-yyyy"),
            DateTimeFormatter.ofPattern("yyyy/MM/dd")
    };

    private static final DateTimeFormatter[] DATETIME_FORMATTERS = {
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"),
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"),
            DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss"),
            DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm:ss")
    };

    @Autowired
    private DipendenteRepository dipendenteRepository;

    @Transactional
    public DipendenteBulkImportResponse bulkImport(DipendenteBulkImportRequest request) {
        long startTime = System.currentTimeMillis();
        
        DipendenteBulkImportResponse response = new DipendenteBulkImportResponse();
        response.setTotalProcessed(request.getDipendenti().size());

        logger.info("Avvio importazione massiva di {} dipendenti", request.getDipendenti().size());

        for (int i = 0; i < request.getDipendenti().size(); i++) {
            DipendenteBulkImportItem item = request.getDipendenti().get(i);
            
            try {
                processItem(item, i, request.getOptions(), response);
            } catch (Exception e) {
                logger.error("Errore durante l'elaborazione della riga {}: {}", i, e.getMessage(), e);
                response.addError(i, "general", "Errore durante l'elaborazione: " + e.getMessage(), item.getNominativo());
                
                if (!request.getOptions().isSkipErrors()) {
                    break;
                }
            }
        }

        response.setExecutionTimeMs(System.currentTimeMillis() - startTime);
        
        logger.info("Importazione completata. Successi: {}, Errori: {}, Aggiornamenti: {}, Tempo: {}ms",
                response.getSuccessCount(), response.getErrorCount(), response.getUpdatedCount(), response.getExecutionTimeMs());

        return response;
    }

    private void processItem(DipendenteBulkImportItem item, int rowIndex, 
                           DipendenteBulkImportRequest.BulkImportOptions options, 
                           DipendenteBulkImportResponse response) {
        
        // Validazione dati
        if (!validateItem(item, rowIndex, response)) {
            return;
        }

        // Estrazione nome e cognome dal nominativo
        String[] nameParts = extractNameAndSurname(item.getNominativo());
        if (nameParts == null) {
            response.addError(rowIndex, "nominativo", "Formato nominativo non valido. Deve contenere nome e cognome separati da spazio", item.getNominativo());
            return;
        }

        String nome = nameParts[0];
        String cognome = nameParts[1];

        // Generazione email automatica se non presente
        String email = generateEmail(nome, cognome);

        // Controllo duplicati
        Optional<Dipendente> existingByEmail = dipendenteRepository.findByEmail(email);
        if (existingByEmail.isPresent()) {
            if (options.isUpdateExisting()) {
                updateExistingDipendente(existingByEmail.get(), item, rowIndex, options, response);
            } else {
                response.addError(rowIndex, "email", "Email già esistente", email);
            }
            return;
        }

        // Creazione nuovo dipendente
        try {
            Dipendente dipendente = createDipendenteFromItem(item, nome, cognome, email, options);
            Dipendente savedDipendente = dipendenteRepository.save(dipendente);
            response.addImportedId(savedDipendente.getId());
            
            logger.debug("Dipendente creato con successo: {} (ID: {})", dipendente.getNomeCompleto(), savedDipendente.getId());
        } catch (Exception e) {
            logger.error("Errore durante la creazione del dipendente {}: {}", item.getNominativo(), e.getMessage());
            response.addError(rowIndex, "general", "Errore durante la creazione: " + e.getMessage(), item.getNominativo());
        }
    }

    private boolean validateItem(DipendenteBulkImportItem item, int rowIndex, DipendenteBulkImportResponse response) {
        boolean valid = true;

        // Validazione nominativo
        if (item.getNominativo() == null || item.getNominativo().trim().isEmpty()) {
            response.addError(rowIndex, "nominativo", "Nominativo obbligatorio", "");
            valid = false;
        }

        // Validazione ruolo
        if (item.getRuolo() == null || item.getRuolo().trim().isEmpty()) {
            response.addError(rowIndex, "ruolo", "Ruolo obbligatorio", "");
            valid = false;
        }

        // Validazione azienda
        if (item.getAzienda() == null || item.getAzienda().trim().isEmpty()) {
            response.addError(rowIndex, "azienda", "Azienda obbligatoria", "");
            valid = false;
        }

        // Validazione ISMS
        if (item.getIsms() != null && !item.getIsms().trim().isEmpty()) {
            if (!item.getIsms().equals("Si") && !item.getIsms().equals("No")) {
                response.addError(rowIndex, "isms", "ISMS deve essere 'Si' o 'No'", item.getIsms());
                valid = false;
            }
        }

        // Validazione data cessazione
        if (item.getDataCessazione() != null && !item.getDataCessazione().trim().isEmpty()) {
            if (parseDate(item.getDataCessazione()) == null) {
                response.addError(rowIndex, "dataCessazione", "Formato data non valido", item.getDataCessazione());
                valid = false;
            }
        }

        return valid;
    }

    private String[] extractNameAndSurname(String nominativo) {
        if (nominativo == null || nominativo.trim().isEmpty()) {
            return null;
        }

        String[] parts = nominativo.trim().split("\\s+");
        if (parts.length < 2) {
            return null;
        }

        // Nome è la prima parte, cognome è tutto il resto
        String nome = parts[0];
        String cognome = String.join(" ", java.util.Arrays.copyOfRange(parts, 1, parts.length));

        return new String[]{nome, cognome};
    }

    private String generateEmail(String nome, String cognome) {
        // Genera email nel formato nome.cognome@azienda.com
        String baseEmail = nome.toLowerCase() + "." + cognome.toLowerCase().replace(" ", "");
        // Rimuovi caratteri speciali
        baseEmail = baseEmail.replaceAll("[^a-z0-9.]", "");
        
        // Dominio di default (può essere configurato)
        String domain = "proxima.it";
        
        String email = baseEmail + "@" + domain;
        
        // Se l'email esiste già, aggiungi un numero
        int counter = 1;
        String originalEmail = email;
        while (dipendenteRepository.findByEmail(email).isPresent()) {
            email = originalEmail.replace("@", counter + "@");
            counter++;
        }
        
        return email;
    }

    private void updateExistingDipendente(Dipendente existing, DipendenteBulkImportItem item, 
                                        int rowIndex, DipendenteBulkImportRequest.BulkImportOptions options, 
                                        DipendenteBulkImportResponse response) {
        
        try {
            // Aggiorna solo i campi non nulli
            if (item.getRuolo() != null && !item.getRuolo().trim().isEmpty()) {
                existing.setRuolo(item.getRuolo().trim());
            }
            if (item.getAzienda() != null && !item.getAzienda().trim().isEmpty()) {
                existing.setAzienda(item.getAzienda().trim());
            }
            if (item.getSede() != null && !item.getSede().trim().isEmpty()) {
                existing.setSede(item.getSede().trim());
            }
            if (item.getCommunity() != null && !item.getCommunity().trim().isEmpty()) {
                existing.setCommunity(item.getCommunity().trim());
            }
            if (item.getResponsabile() != null && !item.getResponsabile().trim().isEmpty()) {
                existing.setResponsabile(item.getResponsabile().trim());
            }
            if (item.getIsms() != null && !item.getIsms().trim().isEmpty()) {
                existing.setIsms(item.getIsms().trim());
            }
            if (item.getDataCessazione() != null && !item.getDataCessazione().trim().isEmpty()) {
                LocalDateTime dataCessazione = parseDate(item.getDataCessazione());
                if (dataCessazione != null) {
                    existing.setDataCessazione(dataCessazione);
                }
            }

            Dipendente updatedDipendente = dipendenteRepository.save(existing);
            response.addUpdatedId(updatedDipendente.getId());
            
            logger.debug("Dipendente aggiornato con successo: {} (ID: {})", existing.getNomeCompleto(), existing.getId());
        } catch (Exception e) {
            logger.error("Errore durante l'aggiornamento del dipendente {}: {}", item.getNominativo(), e.getMessage());
            response.addError(rowIndex, "general", "Errore durante l'aggiornamento: " + e.getMessage(), item.getNominativo());
        }
    }

    private Dipendente createDipendenteFromItem(DipendenteBulkImportItem item, String nome, String cognome, 
                                              String email, DipendenteBulkImportRequest.BulkImportOptions options) {
        
        Dipendente dipendente = new Dipendente();
        dipendente.setNome(nome);
        dipendente.setCognome(cognome);
        dipendente.setEmail(email);
        dipendente.setRuolo(item.getRuolo().trim());
        dipendente.setAzienda(item.getAzienda().trim());
        
        // Campi opzionali
        if (item.getSede() != null && !item.getSede().trim().isEmpty()) {
            dipendente.setSede(item.getSede().trim());
        }
        if (item.getCommunity() != null && !item.getCommunity().trim().isEmpty()) {
            dipendente.setCommunity(item.getCommunity().trim());
        }
        if (item.getResponsabile() != null && !item.getResponsabile().trim().isEmpty()) {
            dipendente.setResponsabile(item.getResponsabile().trim());
        }
        if (item.getIsms() != null && !item.getIsms().trim().isEmpty()) {
            dipendente.setIsms(item.getIsms().trim());
        }
        
        // Data cessazione
        if (item.getDataCessazione() != null && !item.getDataCessazione().trim().isEmpty()) {
            LocalDateTime dataCessazione = parseDate(item.getDataCessazione());
            if (dataCessazione != null) {
                dipendente.setDataCessazione(dataCessazione);
            }
        }

        // Campi con valori di default
        dipendente.setReparto(options.getDefaultReparto());
        dipendente.setCommerciale(options.getDefaultCommerciale());
        
        // Genera codice dipendente automatico
        dipendente.setCodiceDipendente(generateCodiceDipendente(nome, cognome));
        
        dipendente.setAttivo(true);
        dipendente.setDataAssunzione(LocalDateTime.now());
        
        return dipendente;
    }

    private String generateCodiceDipendente(String nome, String cognome) {
        // Genera codice nel formato: prime due lettere nome + prime due lettere cognome + numero casuale
        String base = (nome.substring(0, Math.min(2, nome.length())) + 
                      cognome.substring(0, Math.min(2, cognome.length()))).toUpperCase();
        
        String codice = base + String.format("%04d", (int)(Math.random() * 9999) + 1);
        
        // Assicurati che il codice sia unico
        int counter = 1;
        String originalCodice = codice;
        while (dipendenteRepository.findByCodiceDipendente(codice).isPresent()) {
            codice = originalCodice + String.format("%02d", counter);
            counter++;
        }
        
        return codice;
    }

    private LocalDateTime parseDate(String dateString) {
        if (dateString == null || dateString.trim().isEmpty()) {
            return null;
        }

        String cleanDateString = dateString.trim();
        
        // First try to parse as Excel serial number
        try {
            double excelSerialDate = Double.parseDouble(cleanDateString);
            if (excelSerialDate > 0) {
                // Excel serial date starts from 1900-01-01, but Excel incorrectly treats 1900 as a leap year
                // So we need to subtract 1 day for dates after 1900-02-28
                LocalDate excelEpoch = LocalDate.of(1900, 1, 1);
                long daysSinceEpoch = (long) excelSerialDate - 1; // Excel uses 1-based indexing
                
                // Account for Excel's leap year bug
                if (daysSinceEpoch >= 60) { // After 1900-02-28
                    daysSinceEpoch -= 1;
                }
                
                LocalDate parsedDate = excelEpoch.plusDays(daysSinceEpoch);
                return parsedDate.atStartOfDay();
            }
        } catch (NumberFormatException e) {
            // Not a number, continue with other parsing methods
        }
        
        // Try to parse as LocalDateTime with time
        for (DateTimeFormatter formatter : DATETIME_FORMATTERS) {
            try {
                return LocalDateTime.parse(cleanDateString, formatter);
            } catch (DateTimeParseException e) {
                // Try the next formatter
            }
        }
        
        // If that fails, try to parse as LocalDate and convert to LocalDateTime
        for (DateTimeFormatter formatter : DATE_FORMATTERS) {
            try {
                LocalDate localDate = LocalDate.parse(cleanDateString, formatter);
                return localDate.atStartOfDay();
            } catch (DateTimeParseException e) {
                // Try the next formatter
            }
        }

        // If all formatters fail, log the error
        logger.warn("Unable to parse date string: {}", cleanDateString);
        return null;
    }
}
