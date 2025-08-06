package com.example.demo.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Singolo elemento di aggiornamento LinkedIn Learning")
public class LinkedInBulkUpdateItem {
    
    // Colonna 0: Nome
    @Schema(description = "Nome dipendente (colonna 0)")
    private String nomeDipendente;
    
    // Colonna 1: Email
    @Schema(description = "Email dipendente per identificazione (colonna 1)")
    private String emailDipendente;
    
    // Colonna 2: ID utente univoco
    @Schema(description = "ID utente univoco LinkedIn (colonna 2)")
    private String idUtenteUnico;
    
    // Colonna 3: Nome contenuto
    @Schema(description = "Nome contenuto/corso (colonna 3)")
    private String corso;
    
    // Colonna 4: Fornitore contenuto
    @Schema(description = "Fornitore contenuto (colonna 4)")
    private String fornitoreContenuto;
    
    // Colonna 5: Tipo di contenuto
    @Schema(description = "Tipo di contenuto (colonna 5)")
    private String tipoContenuto;
    
    // Colonna 6: ID contenuto
    @Schema(description = "ID contenuto LinkedIn Learning (colonna 6)")
    private String linkedinContentId;
    
    // Colonna 7: Ore di visione
    @Schema(description = "Ore di visione LinkedIn (colonna 7)")
    private String oreVisione;
    
    // Colonna 8: Percentuale di completamento
    @Schema(description = "Percentuale di completamento (colonna 8)")
    private String percentualeCompletamento;
    
    // Colonna 9: Inizio (PST/PDT)
    @Schema(description = "Data inizio PST/PDT (colonna 9)")
    private String dataInizio;
    
    // Colonna 10: Ultima visualizzazione
    @Schema(description = "Ultima visualizzazione (colonna 10)")
    private String ultimaVisualizzazione;
    
    // Colonna 11: Completamento (PST/PDT)
    @Schema(description = "Data completamento PST/PDT (colonna 11)")
    private String dataCompletamento;
    
    // Colonna 12: Valutazioni totali
    @Schema(description = "Valutazioni totali (colonna 12)")
    private String valutazioniTotali;
    
    // Colonna 13: Numero di valutazioni completate
    @Schema(description = "Numero valutazioni completate (colonna 13)")
    private String numeroValutazioni;
    
    // Colonna 14: Competenze
    @Schema(description = "Competenze acquisite (colonna 14)")
    private String competenze;
    
    // Colonna 15: Nome corso (solo video di LinkedIn)
    @Schema(description = "Nome corso video LinkedIn (colonna 15)")
    private String nomeCorsoLinkedin;
    
    // Colonna 16: ID corso (solo video di LinkedIn)
    @Schema(description = "ID corso video LinkedIn (colonna 16)")
    private String idCorsoLinkedin;
    
    // Colonna 17: Gruppi (al momento dell'interazione)
    @Schema(description = "Gruppi al momento interazione (colonna 17)")
    private String gruppiInterazione;
    
    // Colonna 18: Gruppi (iscrizioni attuali)
    @Schema(description = "Gruppi iscrizioni attuali (colonna 18)")
    private String gruppiAttuali;

    
    public String getCorso() { 
        return corso; // o nomeContenuto, dipende da come hai chiamato il campo
    }

    public String getEmailDipendente() { 
        return emailDipendente; 
    }

    public String getLinkedinContentId() { 
        return linkedinContentId; 
    }
}
