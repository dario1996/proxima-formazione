package com.example.demo.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Schema(description = "Risposta dell'aggiornamento massivo LinkedIn Learning")
public class LinkedInBulkUpdateResponse {
    
    @Schema(description = "Timestamp dell'operazione")
    private LocalDateTime timestamp = LocalDateTime.now();
    
    @Schema(description = "Numero totale di record processati")
    private int totalProcessed;
    
    @Schema(description = "Numero di assegnazioni aggiornate con successo")
    private int successCount;
    
    @Schema(description = "Numero di assegnazioni create ex-novo")
    private int createdCount;
    
    @Schema(description = "Numero di assegnazioni aggiornate (esistenti)")
    private int updatedCount;
    
    @Schema(description = "Numero di corsi creati automaticamente")
    private int coursesCreatedCount;
    
    @Schema(description = "Numero di errori riscontrati")
    private int errorCount;
    
    @Schema(description = "Lista degli errori dettagliati")
    private List<LinkedInUpdateError> errors;
    
    @Schema(description = "Items processati con successo")
    private List<LinkedInBulkUpdateItem> processedItems;
    
    @Schema(description = "Statistiche aggiuntive")
    private LinkedInUpdateStats stats;
    
    @Data
    @Schema(description = "Errore di aggiornamento LinkedIn")
    public static class LinkedInUpdateError {
        @Schema(description = "Numero di riga nel CSV")
        private int rowNumber;
        
        @Schema(description = "Email del dipendente")
        private String emailDipendente;
        
        @Schema(description = "Nome del corso")
        private String nomeCorso;
        
        @Schema(description = "LinkedIn Content ID")
        private String linkedinContentId;
        
        @Schema(description = "Messaggio di errore")
        private String errorMessage;
        
        @Schema(description = "Tipo di errore")
        private String errorType;
        
        public LinkedInUpdateError() {}
        
        public LinkedInUpdateError(int rowNumber, String errorMessage) {
            this.rowNumber = rowNumber;
            this.errorMessage = errorMessage;
            this.errorType = "GENERIC";
        }
        
        public LinkedInUpdateError(int rowNumber, String emailDipendente, String nomeCorso, 
                                  String linkedinContentId, String errorMessage, String errorType) {
            this.rowNumber = rowNumber;
            this.emailDipendente = emailDipendente;
            this.nomeCorso = nomeCorso;
            this.linkedinContentId = linkedinContentId;
            this.errorMessage = errorMessage;
            this.errorType = errorType;
        }
    }
    
    @Data
    @Schema(description = "Statistiche dettagliate dell'operazione LinkedIn")
    public static class LinkedInUpdateStats {
        @Schema(description = "Dipendenti univoci processati")
        private int uniqueEmployees;
        
        @Schema(description = "Corsi univoci processati")
        private int uniqueCourses;
        
        @Schema(description = "Percentuale di completamento media")
        private double averageCompletionPercentage;
        
        @Schema(description = "Ore totali di formazione")
        private double totalTrainingHours;
        
        @Schema(description = "Tempo di elaborazione in millisecondi")
        private long processingTimeMs;
        
        @Schema(description = "Corsi completati al 100%")
        private int fullyCompletedCourses;
    }
}