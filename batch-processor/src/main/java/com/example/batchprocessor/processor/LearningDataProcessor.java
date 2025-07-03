package com.example.batchprocessor.processor;

import com.example.batchprocessor.model.LearningDataRecord;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Processes and validates learning data records from CSV
 * Applies business rules and data cleaning
 */
@Component
public class LearningDataProcessor implements ItemProcessor<LearningDataRecord, LearningDataRecord> {

    @Override
    public LearningDataRecord process(LearningDataRecord item) throws Exception {
        System.out.println("=== PROCESSING RECORD ===");
        System.out.println("Raw item received: " + (item != null ? "NOT NULL" : "NULL"));

        if (item != null) {
            System.out.println("Email: '" + item.getEmail() + "'");
            System.out.println("Content: '" + item.getNomeContenuto() + "'");
            System.out.println("Name: '" + item.getNome() + "'");
        }

        // Skip records with missing essential data
        if (item.getEmail() == null || item.getEmail().trim().isEmpty()) {
            System.out.println("❌ Skipping record with missing email");
            return null; // Skip this record
        }

        if (item.getNomeContenuto() == null || item.getNomeContenuto().trim().isEmpty()) {
            System.out.println("❌ Skipping record with missing content name");
            return null; // Skip this record
        }

        // Validate and clean data
        LearningDataRecord processedItem = new LearningDataRecord();

        // Clean and validate basic fields
        processedItem.setNome(cleanString(item.getNome()));
        processedItem.setEmail(cleanEmail(item.getEmail()));
        processedItem.setIdUtenteUnivoco(cleanString(item.getIdUtenteUnivoco()));
        processedItem.setNomeContenuto(cleanString(item.getNomeContenuto()));
        processedItem.setFornitoreContenuto(cleanString(item.getFornitoreContenuto()));
        processedItem.setTipoContenuto(cleanString(item.getTipoContenuto()));

        // Handle numeric fields
        processedItem.setIdContenuto(item.getIdContenuto());
        processedItem.setIdCorso(item.getIdCorso());

        // Validate percentage completion
        String percentageStr = item.getPercentualeCompletamento();
        if (percentageStr != null && !percentageStr.trim().isEmpty()) {
            BigDecimal percentage = item.getPercentualeCompletamentoAsDecimal();
            if (percentage != null) {
                if (percentage.compareTo(BigDecimal.ZERO) < 0) {
                    percentageStr = "0%";
                } else if (percentage.compareTo(BigDecimal.valueOf(100)) > 0) {
                    percentageStr = "100%";
                }
            }
        }
        processedItem.setPercentualeCompletamento(percentageStr);

        // Handle duration field
        processedItem.setOreVisione(item.getOreVisione());

        // Handle datetime fields (keep as strings for now, will be parsed when needed)
        processedItem.setInizioPstPdt(item.getInizioPstPdt());
        processedItem.setUltimaVisualizzazionePstPdt(item.getUltimaVisualizzazionePstPdt());
        processedItem.setCompletamentoPstPdt(item.getCompletamentoPstPdt());

        // Handle integer fields
        processedItem.setValutazioniTotali(item.getValutazioniTotali());
        processedItem.setNumeroValutazioniCompletate(item.getNumeroValutazioniCompletate());

        // Handle list fields
        processedItem.setCompetenze(cleanString(item.getCompetenze()));
        processedItem.setNomeCorso(cleanString(item.getNomeCorso()));
        processedItem.setGruppiMomentoInterazione(cleanString(item.getGruppiMomentoInterazione()));
        processedItem.setGruppiIscrizioniAttuali(cleanString(item.getGruppiIscrizioniAttuali()));

        System.out.println("Processing record for: " + processedItem.getEmail() +
                " - Content: " + processedItem.getNomeContenuto());

        return processedItem;
    }

    private String cleanString(String input) {
        if (input == null) {
            return null;
        }
        String cleaned = input.trim();
        return cleaned.isEmpty() ? null : cleaned;
    }

    private String cleanEmail(String email) {
        if (email == null) {
            return null;
        }
        return email.trim().toLowerCase();
    }
}