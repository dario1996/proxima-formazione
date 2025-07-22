package com.example.demo.dto;

import java.util.List;

public class CreateMultipleAssegnazioniRequest {
    private List<Long> dipendentiIds;
    private Long corsoId;
    private boolean obbligatorio;
    private String dataTerminePrevista;
    
    // Costruttori
    public CreateMultipleAssegnazioniRequest() {}
    
    // Getters e Setters
    public List<Long> getDipendentiIds() {
        return dipendentiIds;
    }
    
    public void setDipendentiIds(List<Long> dipendentiIds) {
        this.dipendentiIds = dipendentiIds;
    }
    
    public Long getCorsoId() {
        return corsoId;
    }
    
    public void setCorsoId(Long corsoId) {
        this.corsoId = corsoId;
    }
    
    public boolean isObbligatorio() {
        return obbligatorio;
    }
    
    public void setObbligatorio(boolean obbligatorio) {
        this.obbligatorio = obbligatorio;
    }
    
    public String getDataTerminePrevista() {
        return dataTerminePrevista;
    }

    public void setDataTerminePrevista(String dataTerminePrevista) {
        this.dataTerminePrevista = dataTerminePrevista;
    }
}