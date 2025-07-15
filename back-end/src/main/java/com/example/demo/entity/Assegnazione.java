package com.example.demo.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "assegnazioni")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Assegnazione {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relazione molti-a-uno con Dipendente
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dipendente_id", nullable = false)
    @JsonIgnoreProperties({ "assegnazioni", "logLogin" })
    private Dipendente dipendente;

    // Relazione molti-a-uno con Corso
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "corso_id", nullable = false)
    @JsonIgnoreProperties({ "assegnazioni" })
    private Corso corso;

    @Column(name = "data_assegnazione", nullable = false)
    private LocalDate dataAssegnazione;

    @Column(name = "modalita", length = 20)
    private String modalita;

    @Enumerated(EnumType.STRING)
    @Column(name = "stato", nullable = false, length = 20)
    private Stato stato = Stato.INIZIATO;

    @Column(name = "percentuale_completamento", precision = 5, scale = 2)
    private BigDecimal percentualeCompletamento = BigDecimal.ZERO;

    @Column(name = "data_termine_prevista")
    private LocalDate dataTerminePrevista;

    @Column(name = "data_inizio")
    private LocalDate dataInizio;

    @Column(name = "data_fine")
    private LocalDate dataFine;

    @Enumerated(EnumType.STRING)
    @Column(name = "esito", length = 20)
    private Esito esito = Esito.IN_CORSO;

    @Column(name = "attestato", nullable = false)
    private Boolean attestato = false;

    @Column(name = "fonte_richiesta", length = 30)
    private String fonteRichiesta;

    @Column(name = "data_creazione", nullable = false)
    private LocalDateTime dataCreazione;

    @Column(name = "data_modifica")
    private LocalDateTime dataModifica;

    // Enum per stato assegnazione (basato sui valori XML)
    public enum Stato {
        INIZIATO,
        TERMINATO,
        IN_CORSO,
        INTERROTTO
    }

    // Enum per esito assegnazione
    public enum Esito {
        IN_CORSO,
        SUPERATO,
        NON_SUPERATO,
        ABBANDONATO,
        RIMANDATO
    }

    // Costruttori
    public Assegnazione() {
        this.dataCreazione = LocalDateTime.now();
        this.dataAssegnazione = LocalDate.now();
    }

    public Assegnazione(Dipendente dipendente, Corso corso) {
        this();
        this.dipendente = dipendente;
        this.corso = corso;
    }

    // Metodo per aggiornare timestamp modifica
    @PreUpdate
    public void preUpdate() {
        this.dataModifica = LocalDateTime.now();
    }

    // Metodi helper
    public boolean isCompletato() {
        return stato == Stato.TERMINATO;
    }

    public boolean isInRitardo() {
        return dataTerminePrevista != null &&
                LocalDate.now().isAfter(dataTerminePrevista) &&
                !isCompletato();
    }

    public boolean haAttestato() {
        return attestato != null && attestato;
    }

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Dipendente getDipendente() {
        return dipendente;
    }

    public void setDipendente(Dipendente dipendente) {
        this.dipendente = dipendente;
    }

    public Corso getCorso() {
        return corso;
    }

    public void setCorso(Corso corso) {
        this.corso = corso;
    }

    public LocalDate getDataAssegnazione() {
        return dataAssegnazione;
    }

    public void setDataAssegnazione(LocalDate dataAssegnazione) {
        this.dataAssegnazione = dataAssegnazione;
    }

    public String getModalita() {
        return modalita;
    }

    public void setModalita(String modalita) {
        this.modalita = modalita;
    }

    public Stato getStato() {
        return stato;
    }

    public void setStato(Stato stato) {
        this.stato = stato;
    }

    public LocalDate getDataTerminePrevista() {
        return dataTerminePrevista;
    }

    public void setDataTerminePrevista(LocalDate dataTerminePrevista) {
        this.dataTerminePrevista = dataTerminePrevista;
    }

    public LocalDate getDataInizio() {
        return dataInizio;
    }

    public void setDataInizio(LocalDate dataInizio) {
        this.dataInizio = dataInizio;
    }

    public LocalDate getDataFine() {
        return dataFine;
    }

    public void setDataFine(LocalDate dataFine) {
        this.dataFine = dataFine;
    }

    public Esito getEsito() {
        return esito;
    }

    public void setEsito(Esito esito) {
        this.esito = esito;
    }

    public Boolean getAttestato() {
        return attestato;
    }

    public void setAttestato(Boolean attestato) {
        this.attestato = attestato;
    }

    public String getFonteRichiesta() {
        return fonteRichiesta;
    }

    public void setFonteRichiesta(String fonteRichiesta) {
        this.fonteRichiesta = fonteRichiesta;
    }

    public LocalDateTime getDataCreazione() {
        return dataCreazione;
    }

    public void setDataCreazione(LocalDateTime dataCreazione) {
        this.dataCreazione = dataCreazione;
    }

    public LocalDateTime getDataModifica() {
        return dataModifica;
    }

    public void setDataModifica(LocalDateTime dataModifica) {
        this.dataModifica = dataModifica;
    }

    @Override
    public String toString() {
        return "Assegnazione{" +
                "id=" + id +
                ", dataAssegnazione=" + dataAssegnazione +
                ", stato=" + stato +
                ", esito=" + esito +
                ", modalita='" + modalita + '\'' +
                ", attestato=" + attestato +
                '}';
    }

    public BigDecimal getPercentualeCompletamento() {
        return percentualeCompletamento;
    }

    public void setPercentualeCompletamento(BigDecimal percentualeCompletamento) {
        this.percentualeCompletamento = percentualeCompletamento;
    }
}