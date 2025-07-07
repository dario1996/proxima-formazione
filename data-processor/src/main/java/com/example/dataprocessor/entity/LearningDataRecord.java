package com.example.dataprocessor.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Arrays;

@Entity
@Table(name = "learning_data")
@Data
@NoArgsConstructor
@Slf4j
public class LearningDataRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // User Information (parsed from JSON)
    @Column(name = "first_name", length = 100)
    private String firstName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @Column(name = "email", nullable = false, length = 255)
    @JsonProperty("email")
    private String email;

    // Content Information
    @Column(name = "content_name", nullable = false, length = 500)
    @JsonProperty("nomeContenuto")
    private String contentName;

    @Column(name = "content_type", length = 100)
    @JsonProperty("tipoContenuto")
    private String contentType;

    @Column(name = "time_viewed_seconds")
    private Long timeViewedSeconds;

    @Column(name = "percentage_complete", precision = 5, scale = 2)
    private BigDecimal percentageComplete;

    // Completion Information
    @Column(name = "completion_date")
    private LocalDate completionDate;

    // Skills and Rating
    @Column(name = "skills", columnDefinition = "TEXT")
    @JsonProperty("competenze")
    private String skills;

    @Column(name = "rating", precision = 3, scale = 2)
    private BigDecimal rating;

    @Column(name = "total_ratings")
    private Integer totalRatings;

    // Additional JSON fields for processing
    @JsonProperty("nome")
    @Transient
    private String nomeCompleto;

    @JsonProperty("idUtenteUnivoco")
    @Column(name = "employee_id", length = 50)
    private String employeeId;

    @JsonProperty("idContenuto")
    @Column(name = "content_id", length = 50)
    private String contentId;

    @JsonProperty("fornitoreContenuto")
    @Column(name = "provider", length = 100)
    private String provider = "LinkedIn Learning";

    @JsonProperty("oreVisione")
    @Transient
    private String oreVisioneStr;

    @JsonProperty("percentualeCompletamento")
    @Transient
    private String percentualeCompletamentoStr;

    @JsonProperty("completamentoPstPdt")
    @Transient
    private String completamentoPstPdtStr;

    @JsonProperty("valutazioniTotali")
    @Transient
    private String valutazioniTotaliStr;

    @JsonProperty("numeroValutazioniCompletate")
    @Transient
    private String numeroValutazioniCompletateStr;

    // Additional JSON fields that we ignore for now (not needed in database)
    @JsonProperty("inizioPstPdt")
    @Transient
    private String inizioPstPdt;

    @JsonProperty("ultimaVisualizzazionePstPdt")
    @Transient
    private String ultimaVisualizzazionePstPdt;

    @JsonProperty("nomeCorso")
    @Transient
    private String nomeCorso;

    @JsonProperty("idCorso")
    @Transient
    private String idCorso;

    @JsonProperty("gruppiMomentoInterazione")
    @Transient
    private String gruppiMomentoInterazione;

    @JsonProperty("gruppiIscrizioniAttuali")
    @Transient
    private String gruppiIscrizioniAttuali;

    // Additional Information
    @Column(name = "difficulty", length = 50)
    private String difficulty;

    @Column(name = "course_url", columnDefinition = "TEXT")
    private String courseUrl;

    // Processing Information
    @Column(name = "processed_at", nullable = false)
    private LocalDateTime processedAt;

    @Column(name = "source_file", length = 255)
    private String sourceFile;

    @Column(name = "processed", nullable = false)
    private Boolean processed = false;

    // Audit fields
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.processedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // JSON post-processing method to convert string fields to proper types
    @JsonSetter
    public void setNomeCompleto(String nomeCompleto) {
        this.nomeCompleto = nomeCompleto;
        if (nomeCompleto != null && !nomeCompleto.trim().isEmpty()) {
            String[] parts = nomeCompleto.trim().split("\\s+");
            if (parts.length >= 2) {
                this.firstName = parts[0];
                this.lastName = String.join(" ", Arrays.copyOfRange(parts, 1, parts.length));
            } else {
                this.firstName = nomeCompleto.trim();
                this.lastName = "";
            }
        }
    }

    @JsonSetter
    public void setOreVisioneStr(String oreVisione) {
        this.oreVisioneStr = oreVisione;
        if (oreVisione != null && !oreVisione.trim().isEmpty()) {
            try {
                // Parse format HH:MM:SS to seconds
                String[] parts = oreVisione.split(":");
                if (parts.length == 3) {
                    long hours = Long.parseLong(parts[0]);
                    long minutes = Long.parseLong(parts[1]);
                    long seconds = Long.parseLong(parts[2]);
                    this.timeViewedSeconds = hours * 3600 + minutes * 60 + seconds;
                }
            } catch (NumberFormatException e) {
                log.warn("Could not parse time viewed: {}", oreVisione);
            }
        }
    }

    @JsonSetter
    public void setPercentualeCompletamentoStr(String percentuale) {
        this.percentualeCompletamentoStr = percentuale;
        if (percentuale != null && !percentuale.trim().isEmpty()) {
            try {
                // Parse format "100%" to decimal
                String cleanPercentage = percentuale.replace("%", "").trim();
                this.percentageComplete = new BigDecimal(cleanPercentage);
            } catch (NumberFormatException e) {
                log.warn("Could not parse percentage: {}", percentuale);
            }
        }
    }

    @JsonSetter
    public void setCompletamentoPstPdtStr(String completamento) {
        this.completamentoPstPdtStr = completamento;
        if (completamento != null && !completamento.trim().isEmpty()) {
            try {
                // Parse format "01/06/25 14:51" to LocalDate
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yy HH:mm");
                LocalDateTime dateTime = LocalDateTime.parse(completamento, formatter);
                this.completionDate = dateTime.toLocalDate();
            } catch (DateTimeParseException e) {
                log.warn("Could not parse completion date: {}", completamento);
            }
        }
    }

    @JsonSetter
    public void setValutazioniTotaliStr(String valutazioni) {
        this.valutazioniTotaliStr = valutazioni;
        if (valutazioni != null && !valutazioni.trim().isEmpty()) {
            try {
                this.totalRatings = Integer.parseInt(valutazioni.trim());
            } catch (NumberFormatException e) {
                log.warn("Could not parse total ratings: {}", valutazioni);
            }
        }
    }

    // Helper methods for validation
    @JsonIgnore
    public boolean isValid() {
        return email != null && !email.isEmpty() &&
                contentName != null && !contentName.isEmpty();
    }

    @JsonIgnore
    public String getFullName() {
        if (firstName != null && lastName != null) {
            return firstName + " " + lastName;
        } else if (firstName != null) {
            return firstName;
        } else if (lastName != null) {
            return lastName;
        }
        return email; // fallback to email
    }
}