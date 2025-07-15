package com.example.demo.controller;

import com.example.demo.entity.Assegnazione;
import com.example.demo.entity.Corso;
import com.example.demo.entity.Dipendente;
import com.example.demo.repository.AssegnazioneRepository;
import com.example.demo.repository.CorsoRepository;
import com.example.demo.repository.DipendenteRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
@Tag(name = "Assegnazioni", description = "Gestione delle assegnazioni corsi ai dipendenti")
public class AssegnazioneController {

    @Autowired
    private AssegnazioneRepository assegnazioneRepository;

    @Autowired
    private DipendenteRepository dipendenteRepository;

    @Autowired
    private CorsoRepository corsoRepository;

    @Operation(summary = "Assegna un corso a un dipendente", description = "Crea una nuova assegnazione collegando un dipendente specifico a un corso specifico. "
            + "Lo stato iniziale sarà INIZIATO e la data di assegnazione sarà quella corrente.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Assegnazione creata con successo", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Assegnazione.class))),
            @ApiResponse(responseCode = "404", description = "Dipendente o corso non trovato"),
            @ApiResponse(responseCode = "409", description = "Assegnazione già esistente per questo dipendente e corso")
    })
    @PostMapping("/dipendenti/{dipendenteId}/corsi/{corsoId}")
    public ResponseEntity<?> assignCorsoToDipendente(
            @Parameter(description = "ID del dipendente a cui assegnare il corso", required = true) @PathVariable Long dipendenteId,
            @Parameter(description = "ID del corso da assegnare", required = true) @PathVariable Long corsoId,
            @Parameter(description = "Modalità di fruizione del corso") @RequestParam(required = false) String modalita,
            @Parameter(description = "Data termine prevista (YYYY-MM-DD)") @RequestParam(required = false) String dataTerminePrevista,
            @Parameter(description = "Fonte della richiesta") @RequestParam(required = false) String fonteRichiesta) {

        // Verifica esistenza dipendente
        Optional<Dipendente> dipendente = dipendenteRepository.findById(dipendenteId);
        if (!dipendente.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Dipendente non trovato con ID: " + dipendenteId);
        }

        // Verifica esistenza corso
        Optional<Corso> corso = corsoRepository.findById(corsoId);
        if (!corso.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Corso non trovato con ID: " + corsoId);
        }

        // Verifica se l'assegnazione esiste già
        if (assegnazioneRepository.existsByDipendenteIdAndCorsoId(dipendenteId, corsoId)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Assegnazione già esistente per dipendente " + dipendenteId + " e corso " + corsoId);
        }

        // Crea nuova assegnazione
        Assegnazione assegnazione = new Assegnazione();
        assegnazione.setDipendente(dipendente.get());
        assegnazione.setCorso(corso.get());
        assegnazione.setStato(Assegnazione.Stato.INIZIATO); // Default dal DB
        assegnazione.setEsito(Assegnazione.Esito.IN_CORSO); // Default dal DB
        assegnazione.setDataAssegnazione(LocalDate.now());
        assegnazione.setDataCreazione(LocalDateTime.now());
        
        // Parametri opzionali
        if (modalita != null) {
            assegnazione.setModalita(modalita);
        }
        
        if (dataTerminePrevista != null) {
            try {
                assegnazione.setDataTerminePrevista(LocalDate.parse(dataTerminePrevista));
            } catch (Exception e) {
                return ResponseEntity.badRequest().body("Formato data non valido. Usare YYYY-MM-DD");
            }
        }
        
        if (fonteRichiesta != null) {
            assegnazione.setFonteRichiesta(fonteRichiesta);
        }

        Assegnazione savedAssegnazione = assegnazioneRepository.save(assegnazione);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedAssegnazione);
    }

    @Operation(summary = "Recupera tutte le assegnazioni di un dipendente", description = "Restituisce l'elenco completo dei corsi assegnati a un dipendente specifico")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista assegnazioni recuperata con successo", content = @Content(mediaType = "application/json", schema = @Schema(type = "array", implementation = Assegnazione.class))),
            @ApiResponse(responseCode = "404", description = "Dipendente non trovato")
    })
    @GetMapping("/dipendenti/{dipendenteId}/assegnazioni")
    public ResponseEntity<?> getAssegnazionesByDipendente(
            @Parameter(description = "ID del dipendente", required = true) @PathVariable Long dipendenteId) {

        if (!dipendenteRepository.existsById(dipendenteId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Dipendente non trovato con ID: " + dipendenteId);
        }

        List<Assegnazione> assegnazioni = assegnazioneRepository.findByDipendenteId(dipendenteId);
        return ResponseEntity.ok(assegnazioni);
    }

    @Operation(summary = "Recupera tutte le assegnazioni di un corso", description = "Restituisce l'elenco completo dei dipendenti assegnati a un corso specifico")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista assegnazioni recuperata con successo"),
            @ApiResponse(responseCode = "404", description = "Corso non trovato")
    })
    @GetMapping("/corsi/{corsoId}/assegnazioni")
    public ResponseEntity<?> getAssegnazioniByCorso(
            @Parameter(description = "ID del corso", required = true) @PathVariable Long corsoId) {

        if (!corsoRepository.existsById(corsoId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Corso non trovato con ID: " + corsoId);
        }

        List<Assegnazione> assegnazioni = assegnazioneRepository.findByCorsoId(corsoId);
        return ResponseEntity.ok(assegnazioni);
    }

    @Operation(summary = "Recupera una specifica assegnazione", description = "Restituisce i dettagli di una specifica assegnazione tramite il suo ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Assegnazione trovata"),
            @ApiResponse(responseCode = "404", description = "Assegnazione non trovata")
    })
    @GetMapping("/assegnazioni/{assegnazioneId}")
    public ResponseEntity<Assegnazione> getAssegnazioneById(
            @Parameter(description = "ID dell'assegnazione", required = true) @PathVariable Long assegnazioneId) {

        Optional<Assegnazione> assegnazione = assegnazioneRepository.findById(assegnazioneId);
        return assegnazione.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Aggiorna lo stato di un'assegnazione", description = "Modifica lo stato di progresso di un'assegnazione")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Assegnazione aggiornata con successo"),
            @ApiResponse(responseCode = "404", description = "Assegnazione non trovata"),
            @ApiResponse(responseCode = "400", description = "Stato non valido")
    })
    @PutMapping("/assegnazioni/{assegnazioneId}/stato")
    public ResponseEntity<?> updateAssegnazioneStato(
            @Parameter(description = "ID dell'assegnazione", required = true) @PathVariable Long assegnazioneId,
            @Parameter(description = "Nuovo stato dell'assegnazione", schema = @Schema(allowableValues = { 
                "INIZIATO", "IN_CORSO", "COMPLETATO", "NON_INIZIATO", "SOSPESO", "ANNULLATO" })) @RequestParam String stato) {

        Optional<Assegnazione> optionalAssegnazione = assegnazioneRepository.findById(assegnazioneId);
        if (!optionalAssegnazione.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        try {
            Assegnazione.Stato nuovoStato = Assegnazione.Stato.valueOf(stato.toUpperCase());
            Assegnazione assegnazione = optionalAssegnazione.get();
            assegnazione.setStato(nuovoStato);

            // Se completato, imposta data fine
            if (nuovoStato == Assegnazione.Stato.TERMINATO) {
                assegnazione.setDataFine(LocalDate.now());
                assegnazione.setEsito(Assegnazione.Esito.SUPERATO);
            }

            // Se iniziato o in corso, imposta data inizio se non presente
            if ((nuovoStato == Assegnazione.Stato.IN_CORSO || 
                 nuovoStato == Assegnazione.Stato.INIZIATO) && 
                 assegnazione.getDataInizio() == null) {
                assegnazione.setDataInizio(LocalDate.now());
            }

            // Aggiorna timestamp modifica
            assegnazione.setDataModifica(LocalDateTime.now());

            Assegnazione updatedAssegnazione = assegnazioneRepository.save(assegnazione);
            return ResponseEntity.ok(updatedAssegnazione);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body("Stato non valido: " + stato
                            + ". Stati validi: INIZIATO, IN_CORSO, COMPLETATO, NON_INIZIATO, SOSPESO, ANNULLATO");
        }
    }

    @Operation(summary = "Aggiorna l'esito di un'assegnazione", description = "Modifica l'esito di un'assegnazione")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Assegnazione aggiornata con successo"),
            @ApiResponse(responseCode = "404", description = "Assegnazione non trovata"),
            @ApiResponse(responseCode = "400", description = "Esito non valido")
    })
    @PutMapping("/assegnazioni/{assegnazioneId}/esito")
    public ResponseEntity<?> updateAssegnazioneEsito(
            @Parameter(description = "ID dell'assegnazione", required = true) @PathVariable Long assegnazioneId,
            @Parameter(description = "Nuovo esito dell'assegnazione", schema = @Schema(allowableValues = { 
                "IN_CORSO", "SUPERATO", "NON_SUPERATO", "ABBANDONATO", "RIMANDATO" })) @RequestParam String esito) {

        Optional<Assegnazione> optionalAssegnazione = assegnazioneRepository.findById(assegnazioneId);
        if (!optionalAssegnazione.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        try {
            Assegnazione.Esito nuovoEsito = Assegnazione.Esito.valueOf(esito.toUpperCase());
            Assegnazione assegnazione = optionalAssegnazione.get();
            assegnazione.setEsito(nuovoEsito);

            // Se superato, marca come completato e imposta data fine
            if (nuovoEsito == Assegnazione.Esito.SUPERATO) {
                assegnazione.setStato(Assegnazione.Stato.TERMINATO);
                assegnazione.setDataFine(LocalDate.now());
                assegnazione.setAttestato(true);
            }

            // Se abbandonato o non superato, marca come annullato
            if (nuovoEsito == Assegnazione.Esito.ABBANDONATO || 
                nuovoEsito == Assegnazione.Esito.NON_SUPERATO) {
                assegnazione.setStato(Assegnazione.Stato.TERMINATO);
                assegnazione.setDataFine(LocalDate.now());
            }

            // Aggiorna timestamp modifica
            assegnazione.setDataModifica(LocalDateTime.now());

            Assegnazione updatedAssegnazione = assegnazioneRepository.save(assegnazione);
            return ResponseEntity.ok(updatedAssegnazione);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body("Esito non valido: " + esito
                            + ". Esiti validi: IN_CORSO, SUPERATO, NON_SUPERATO, ABBANDONATO, RIMANDATO");
        }
    }

    @Operation(summary = "Recupera tutte le assegnazioni", description = "Restituisce l'elenco completo delle assegnazioni con possibilità di filtro")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista assegnazioni recuperata con successo")
    })
    @GetMapping("/assegnazioni")
    public ResponseEntity<?> getAllAssegnazioni(
            @Parameter(description = "Filtra per stato assegnazione") @RequestParam(required = false) String stato,
            @Parameter(description = "Filtra per esito assegnazione") @RequestParam(required = false) String esito,
            @Parameter(description = "Filtra per modalità") @RequestParam(required = false) String modalita,
            @Parameter(description = "Mostra solo con attestato") @RequestParam(required = false, defaultValue = "false") boolean conAttestato,
            @Parameter(description = "Filtra per fonte richiesta") @RequestParam(required = false) String fonteRichiesta) {

        List<Assegnazione> assegnazioni;

        try {
            if (stato != null) {
                Assegnazione.Stato statoEnum = Assegnazione.Stato.valueOf(stato.toUpperCase());
                assegnazioni = assegnazioneRepository.findByStato(statoEnum);
            } else if (esito != null) {
                Assegnazione.Esito esitoEnum = Assegnazione.Esito.valueOf(esito.toUpperCase());
                assegnazioni = assegnazioneRepository.findByEsito(esitoEnum);
            } else if (modalita != null) {
                assegnazioni = assegnazioneRepository.findByModalita(modalita);
            } else if (conAttestato) {
                assegnazioni = assegnazioneRepository.findByAttestatoTrue();
            } else if (fonteRichiesta != null) {
                assegnazioni = assegnazioneRepository.findByFonteRichiesta(fonteRichiesta);
            } else {
                assegnazioni = assegnazioneRepository.findAll();
            }

            return ResponseEntity.ok(assegnazioni);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Parametro non valido: " + e.getMessage());
        }
    }

    @Operation(summary = "Aggiorna un'assegnazione completa", description = "Aggiorna tutti i dettagli di un'assegnazione")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Assegnazione aggiornata con successo"),
            @ApiResponse(responseCode = "404", description = "Assegnazione non trovata"),
            @ApiResponse(responseCode = "400", description = "Dati non validi")
    })
    @PutMapping("/assegnazioni/{assegnazioneId}")
    public ResponseEntity<?> updateAssegnazione(
            @Parameter(description = "ID dell'assegnazione", required = true) @PathVariable Long assegnazioneId,
            @Parameter(description = "Nuovo stato") @RequestParam(required = false) String stato,
            @Parameter(description = "Nuovo esito") @RequestParam(required = false) String esito,
            @Parameter(description = "Modalità") @RequestParam(required = false) String modalita,
            @Parameter(description = "Data termine prevista (YYYY-MM-DD)") @RequestParam(required = false) String dataTerminePrevista,
            @Parameter(description = "Data inizio (YYYY-MM-DD)") @RequestParam(required = false) String dataInizio,
            @Parameter(description = "Data fine (YYYY-MM-DD)") @RequestParam(required = false) String dataFine,
            @Parameter(description = "Attestato ottenuto") @RequestParam(required = false) Boolean attestato,
            @Parameter(description = "Fonte richiesta") @RequestParam(required = false) String fonteRichiesta) {

        Optional<Assegnazione> optionalAssegnazione = assegnazioneRepository.findById(assegnazioneId);
        if (!optionalAssegnazione.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Assegnazione assegnazione = optionalAssegnazione.get();

        try {
            // Aggiorna stato se fornito
            if (stato != null) {
                Assegnazione.Stato nuovoStato = Assegnazione.Stato.valueOf(stato.toUpperCase());
                assegnazione.setStato(nuovoStato);
            }

            // Aggiorna esito se fornito
            if (esito != null) {
                Assegnazione.Esito nuovoEsito = Assegnazione.Esito.valueOf(esito.toUpperCase());
                assegnazione.setEsito(nuovoEsito);
            }

            // Aggiorna modalità se fornita
            if (modalita != null) {
                assegnazione.setModalita(modalita);
            }

            // Aggiorna date se fornite
            if (dataTerminePrevista != null) {
                assegnazione.setDataTerminePrevista(LocalDate.parse(dataTerminePrevista));
            }

            if (dataInizio != null) {
                assegnazione.setDataInizio(LocalDate.parse(dataInizio));
            }

            if (dataFine != null) {
                assegnazione.setDataFine(LocalDate.parse(dataFine));
            }

            // Aggiorna attestato se fornito
            if (attestato != null) {
                assegnazione.setAttestato(attestato);
            }

            // Aggiorna fonte richiesta se fornita
            if (fonteRichiesta != null) {
                assegnazione.setFonteRichiesta(fonteRichiesta);
            }

            // Aggiorna timestamp modifica
            assegnazione.setDataModifica(LocalDateTime.now());

            Assegnazione updatedAssegnazione = assegnazioneRepository.save(assegnazione);
            return ResponseEntity.ok(updatedAssegnazione);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Parametro non valido: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Formato data non valido. Usare YYYY-MM-DD");
        }
    }

    @Operation(summary = "Elimina un'assegnazione", description = "Rimuove un'assegnazione corso-dipendente dal sistema")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Assegnazione eliminata con successo"),
            @ApiResponse(responseCode = "404", description = "Assegnazione non trovata")
    })
    @DeleteMapping("/assegnazioni/{assegnazioneId}")
    public ResponseEntity<Void> deleteAssegnazione(
            @Parameter(description = "ID dell'assegnazione da eliminare", required = true) @PathVariable Long assegnazioneId) {

        if (!assegnazioneRepository.existsById(assegnazioneId)) {
            return ResponseEntity.notFound().build();
        }

        assegnazioneRepository.deleteById(assegnazioneId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Recupera assegnazioni in ritardo", description = "Restituisce le assegnazioni con data termine prevista scaduta")
    @GetMapping("/assegnazioni/ritardo")
    public ResponseEntity<List<Assegnazione>> getAssegnazioniInRitardo() {
        List<Assegnazione> assegnazioni = assegnazioneRepository.findAssegnazioniInRitardo(LocalDate.now());
        return ResponseEntity.ok(assegnazioni);
    }

    @Operation(summary = "Recupera assegnazioni completate", description = "Restituisce le assegnazioni completate con successo")
    @GetMapping("/assegnazioni/completate")
    public ResponseEntity<List<Assegnazione>> getAssegnazioniCompletate() {
        List<Assegnazione> assegnazioni = assegnazioneRepository.findByStatoAndEsito(
            Assegnazione.Stato.TERMINATO, 
            Assegnazione.Esito.SUPERATO
        );
        return ResponseEntity.ok(assegnazioni);
    }
}