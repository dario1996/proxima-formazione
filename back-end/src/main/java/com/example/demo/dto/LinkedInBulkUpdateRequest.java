package com.example.demo.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

@Data
@Schema(description = "Richiesta per l'aggiornamento massivo da LinkedIn Learning CSV")
public class LinkedInBulkUpdateRequest {
    
    @Schema(description = "Lista delle assegnazioni LinkedIn da processare", required = true)
    private List<LinkedInBulkUpdateItem> assegnazioni;
    
    @Schema(description = "Opzioni per l'importazione LinkedIn")
    private LinkedInImportOptions options;
    
    @Data
    @Schema(description = "Opzioni per l'importazione LinkedIn Learning")
    public static class LinkedInImportOptions {
        @Schema(description = "Aggiorna assegnazioni esistenti", defaultValue = "true")
        private boolean updateExisting = true;
        
        @Schema(description = "Crea corsi mancanti automaticamente", defaultValue = "true")
        private boolean createMissingCourses = true;
        
        @Schema(description = "Fonte dell'importazione", defaultValue = "LinkedIn Learning")
        private String source = "LinkedIn Learning";
        
        @Schema(description = "Sovrascrivi dati esistenti anche se più recenti", defaultValue = "false")
        private boolean forceOverwrite = false;
    }
}