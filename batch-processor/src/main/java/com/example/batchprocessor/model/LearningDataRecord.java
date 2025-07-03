package com.example.batchprocessor.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.time.Duration;
import java.math.BigDecimal;

/**
 * Represents a single record from LinkedIn Learning CSV export
 * Maps to the 19 columns specified in the requirements
 * Uses Spring Batch field mapping instead of OpenCSV annotations
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LearningDataRecord {

    private String nome; // Nome del discente
    private String email; // Email dell'utente
    private String idUtenteUnivoco; // ID univoco dell'account
    private String nomeContenuto; // Titolo del corso/video/percorso
    private String fornitoreContenuto; // Fonte del corso (LinkedIn Learning, etc.)
    private String tipoContenuto; // Course, Video, Learning Path
    private String idContenuto; // ID numerico LinkedIn (as String for CSV parsing)
    private String oreVisione; // Durata formato hh:mm:ss
    private String percentualeCompletamento; // 0-100% (as String for CSV parsing)
    private String inizioPstPdt; // Timestamp primo accesso (fuso US Pacific)
    private String ultimaVisualizzazionePstPdt; // Ultimo evento nel periodo
    private String completamentoPstPdt; // Momento completamento
    private String valutazioniTotali; // Numero valutazioni ricevute (as String for CSV parsing)
    private String numeroValutazioniCompletate; // Valutazioni compilate dall'utente (as String for CSV parsing)
    private String competenze; // Skill tag separate da punto e virgola
    private String nomeCorso; // Titolo corso (solo per video LinkedIn)
    private String idCorso; // ID corso principale (as String for CSV parsing)
    private String gruppiMomentoInterazione; // Gruppi al momento interazione
    private String gruppiIscrizioniAttuali; // Gruppi iscrizioni attuali

    // Helper methods for data conversion
    @com.fasterxml.jackson.annotation.JsonIgnore
    public Duration getOreVisioneDuration() {
        if (oreVisione == null || oreVisione.trim().isEmpty()) {
            return Duration.ZERO;
        }
        try {
            String[] parts = oreVisione.split(":");
            if (parts.length == 3) {
                long hours = Long.parseLong(parts[0]);
                long minutes = Long.parseLong(parts[1]);
                long seconds = Long.parseLong(parts[2]);
                return Duration.ofHours(hours).plusMinutes(minutes).plusSeconds(seconds);
            }
        } catch (NumberFormatException e) {
            // Log error and return zero duration
            System.err.println("Error parsing duration: " + oreVisione);
        }
        return Duration.ZERO;
    }

    @com.fasterxml.jackson.annotation.JsonIgnore
    public BigDecimal getOreVisioneAsDecimal() {
        Duration duration = getOreVisioneDuration();
        return BigDecimal.valueOf(duration.toMinutes()).divide(BigDecimal.valueOf(60), 2, BigDecimal.ROUND_HALF_UP);
    }

    // Helper methods for converting string fields to proper types
    @com.fasterxml.jackson.annotation.JsonIgnore
    public Long getIdContenutoAsLong() {
        if (idContenuto == null || idContenuto.trim().isEmpty()) {
            return null;
        }
        try {
            return Long.parseLong(idContenuto.trim());
        } catch (NumberFormatException e) {
            System.err.println("Error parsing idContenuto: " + idContenuto);
            return null;
        }
    }

    @com.fasterxml.jackson.annotation.JsonIgnore
    public BigDecimal getPercentualeCompletamentoAsDecimal() {
        if (percentualeCompletamento == null || percentualeCompletamento.trim().isEmpty()) {
            return BigDecimal.ZERO;
        }
        try {
            String cleanPercent = percentualeCompletamento.replace("%", "").trim();
            return new BigDecimal(cleanPercent);
        } catch (NumberFormatException e) {
            System.err.println("Error parsing percentualeCompletamento: " + percentualeCompletamento);
            return BigDecimal.ZERO;
        }
    }

    @com.fasterxml.jackson.annotation.JsonIgnore
    public Integer getValutazioniTotaliAsInteger() {
        if (valutazioniTotali == null || valutazioniTotali.trim().isEmpty()) {
            return 0;
        }
        try {
            return Integer.parseInt(valutazioniTotali.trim());
        } catch (NumberFormatException e) {
            System.err.println("Error parsing valutazioniTotali: " + valutazioniTotali);
            return 0;
        }
    }

    @com.fasterxml.jackson.annotation.JsonIgnore
    public Integer getNumeroValutazioniCompletateAsInteger() {
        if (numeroValutazioniCompletate == null || numeroValutazioniCompletate.trim().isEmpty()) {
            return 0;
        }
        try {
            return Integer.parseInt(numeroValutazioniCompletate.trim());
        } catch (NumberFormatException e) {
            System.err.println("Error parsing numeroValutazioniCompletate: " + numeroValutazioniCompletate);
            return 0;
        }
    }

    @com.fasterxml.jackson.annotation.JsonIgnore
    public Long getIdCorsoAsLong() {
        if (idCorso == null || idCorso.trim().isEmpty()) {
            return null;
        }
        try {
            return Long.parseLong(idCorso.trim());
        } catch (NumberFormatException e) {
            System.err.println("Error parsing idCorso: " + idCorso);
            return null;
        }
    }

    @com.fasterxml.jackson.annotation.JsonIgnore
    public LocalDateTime parseDataTime(String dateTimeStr) {
        if (dateTimeStr == null || dateTimeStr.trim().isEmpty()) {
            return null;
        }
        try {
            // This will need to be adjusted based on the actual format from LinkedIn
            // Common formats might be: "yyyy-MM-dd HH:mm:ss" or ISO format
            // For now, returning null and will need to implement proper parsing
            return null;
        } catch (Exception e) {
            System.err.println("Error parsing datetime: " + dateTimeStr);
            return null;
        }
    }

    @com.fasterxml.jackson.annotation.JsonIgnore
    public LocalDateTime getInizioLocalDateTime() {
        return parseDataTime(inizioPstPdt);
    }

    @com.fasterxml.jackson.annotation.JsonIgnore
    public LocalDateTime getUltimaVisualizzazioneLocalDateTime() {
        return parseDataTime(ultimaVisualizzazionePstPdt);
    }

    @com.fasterxml.jackson.annotation.JsonIgnore
    public LocalDateTime getCompletamentoLocalDateTime() {
        return parseDataTime(completamentoPstPdt);
    }
}