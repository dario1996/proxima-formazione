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
            +
            "Lo stato iniziale sarà ASSEGNATO e la data di assegnazione sarà quella corrente.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Assegnazione creata con successo", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Assegnazione.class))),
            @ApiResponse(responseCode = "404", description = "Dipendente o corso non trovato"),
            @ApiResponse(responseCode = "409", description = "Assegnazione già esistente per questo dipendente e corso")
    })
    @PostMapping("/dipendenti/{dipendenteId}/corsi/{corsoId}")
    public ResponseEntity<?> assignCorsoToDipendente(
            @Parameter(description = "ID del dipendente a cui assegnare il corso", required = true) @PathVariable Long dipendenteId,
            @Parameter(description = "ID del corso da assegnare", required = true) @PathVariable Long corsoId) {

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
        assegnazione.setStato(Assegnazione.StatoAssegnazione.ASSEGNATO);
        assegnazione.setDataAssegnazione(LocalDate.now());

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

    @Operation(summary = "Aggiorna lo stato di un'assegnazione", description = "Modifica lo stato di progresso di un'assegnazione (es. da ASSEGNATO a IN_CORSO a COMPLETATO)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Assegnazione aggiornata con successo"),
            @ApiResponse(responseCode = "404", description = "Assegnazione non trovata"),
            @ApiResponse(responseCode = "400", description = "Stato non valido")
    })
    @PutMapping("/assegnazioni/{assegnazioneId}/stato")
    public ResponseEntity<?> updateAssegnazioneStato(
            @Parameter(description = "ID dell'assegnazione", required = true) @PathVariable Long assegnazioneId,
            @Parameter(description = "Nuovo stato dell'assegnazione", schema = @Schema(allowableValues = { "ASSEGNATO",
                    "IN_CORSO", "COMPLETATO", "NON_INIZIATO", "SOSPESO", "ANNULLATO" })) @RequestParam String stato) {

        Optional<Assegnazione> optionalAssegnazione = assegnazioneRepository.findById(assegnazioneId);
        if (!optionalAssegnazione.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        try {
            Assegnazione.StatoAssegnazione nuovoStato = Assegnazione.StatoAssegnazione.valueOf(stato.toUpperCase());
            Assegnazione assegnazione = optionalAssegnazione.get();
            assegnazione.setStato(nuovoStato);

            // Se completato, imposta data completamento
            if (nuovoStato == Assegnazione.StatoAssegnazione.COMPLETATO) {
                assegnazione.setDataCompletamento(LocalDate.now());
                assegnazione.setPercentualeCompletamento(new java.math.BigDecimal("100.00"));
            }

            // Se iniziato, imposta data inizio
            if (nuovoStato == Assegnazione.StatoAssegnazione.IN_CORSO && assegnazione.getDataInizio() == null) {
                assegnazione.setDataInizio(LocalDate.now());
            }

            Assegnazione updatedAssegnazione = assegnazioneRepository.save(assegnazione);
            return ResponseEntity.ok(updatedAssegnazione);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body("Stato non valido: " + stato
                            + ". Stati validi: ASSEGNATO, IN_CORSO, COMPLETATO, NON_INIZIATO, SOSPESO, ANNULLATO");
        }
    }

    @Operation(summary = "Recupera tutte le assegnazioni", description = "Restituisce l'elenco completo delle assegnazioni con possibilità di filtro per stato")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista assegnazioni recuperata con successo")
    })
    @GetMapping("/assegnazioni")
    public ResponseEntity<List<Assegnazione>> getAllAssegnazioni(
            @Parameter(description = "Filtra per stato assegnazione", schema = @Schema(allowableValues = { "ASSEGNATO",
                    "IN_CORSO", "COMPLETATO", "NON_INIZIATO", "SOSPESO",
                    "ANNULLATO" })) @RequestParam(required = false) String stato,
            @Parameter(description = "Mostra solo assegnazioni obbligatorie") @RequestParam(required = false, defaultValue = "false") boolean soloObbligatorie,
            @Parameter(description = "Mostra solo assegnazioni che richiedono feedback") @RequestParam(required = false, defaultValue = "false") boolean richiedeFeedback) {

        List<Assegnazione> assegnazioni;

        if (stato != null) {
            try {
                Assegnazione.StatoAssegnazione statoEnum = Assegnazione.StatoAssegnazione.valueOf(stato.toUpperCase());
                assegnazioni = assegnazioneRepository.findByStato(statoEnum);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
        } else if (soloObbligatorie) {
            assegnazioni = assegnazioneRepository.findByObbligatorioTrue();
        } else if (richiedeFeedback) {
            assegnazioni = assegnazioneRepository.findCompletedAssignmentsRequiringFeedback();
        } else {
            assegnazioni = assegnazioneRepository.findAll();
        }

        return ResponseEntity.ok(assegnazioni);
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
}