package com.example.demo.controller;

import com.example.demo.dto.CorsoCreateRequest;
import com.example.demo.entity.Corso;
import com.example.demo.entity.Piattaforma;
import com.example.demo.repository.CorsoRepository;
import com.example.demo.repository.PiattaformaRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;
import lombok.SneakyThrows;
import lombok.extern.java.Log;
import com.example.demo.services.CorsoService;
import com.example.demo.exceptions.NotFoundException;

@RestController
@RequestMapping("/api/corsi")
@CrossOrigin(origins = "*")
@Log
@Tag(name = "Corsi", description = "Gestione dei corsi di formazione")
public class CorsoController {

    @Autowired
    private CorsoService corsoService;

    @Autowired
    private CorsoRepository corsoRepository;

    @Autowired
    private PiattaformaRepository piattaformaRepository;

    @Operation(summary = "Crea un nuovo corso", description = "Inserisce un nuovo corso associato a una piattaforma di formazione esistente")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Corso creato con successo", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Corso.class))),
            @ApiResponse(responseCode = "400", description = "Dati richiesta non validi"),
            @ApiResponse(responseCode = "404", description = "Piattaforma non trovata"),
            @ApiResponse(responseCode = "409", description = "Corso già esistente (codice corso duplicato)")
    })
    @PostMapping
    public ResponseEntity<?> createCorso(
            @Valid @RequestBody @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Dati del corso da creare", content = @Content(mediaType = "application/json", schema = @Schema(implementation = CorsoCreateRequest.class), examples = @ExampleObject(name = "Esempio corso", value = """
                    {
                      "nome": "Project Management Base",
                      "piattaformaId": 1,
                      "stato": "PIANIFICATO",
                      "dataInizio": "2025-06-01",
                      "dataFine": "2025-06-15",
                      "durata": 12.0,
                      "feedbackRichiesto": true
                    }
                    """))) CorsoCreateRequest request) {

        // Verifica esistenza piattaforma
        Optional<Piattaforma> piattaforma = piattaformaRepository.findById(request.getPiattaformaId());
        if (!piattaforma.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Piattaforma non trovata con ID: " + request.getPiattaformaId());
        }

        // Crea nuovo corso
        Corso corso = new Corso();
        corso.setNome(request.getNome());
        corso.setPiattaforma(piattaforma.get());
        corso.setStato(request.getStatoEnum());
        corso.setDataInizio(request.getDataInizio());
        corso.setDataFine(request.getDataFine());
        corso.setDurata(request.getDurata());
        corso.setFeedbackRichiesto(request.getFeedbackRichiesto());
        corso.setCategoria(request.getCategoria());
        corso.setArgomento(request.getArgomento());
        corso.setPriorita(request.getPriorita());
        corso.setUrlCorso(request.getUrlCorso());
        corso.setCosto(request.getCosto());
        corso.setCertificazioneRilasciata(request.getCertificazioneRilasciata());

        Corso savedCorso = corsoRepository.save(corso);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedCorso);
    }

    /*@Operation(summary = "Recupera l'elenco dei corsi", description = "Restituisce tutti i corsi con possibilità di filtro per piattaforma, stato o nome")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista corsi recuperata con successo", content = @Content(mediaType = "application/json", schema = @Schema(type = "array", implementation = Corso.class)))
    })*/
    /*@GetMapping
    public ResponseEntity<List<Corso>> getAllCorsi(
            @Parameter(description = "ID della piattaforma per filtrare i corsi") @RequestParam(required = false) Long piattaformaId,
            @Parameter(description = "Stato del corso per filtrare", schema = @Schema(allowableValues = { "PIANIFICATO",
                    "IN_CORSO", "COMPLETATO", "SOSPESO", "ANNULLATO",
                    "SCADUTO" })) @RequestParam(required = false) String stato,
            @Parameter(description = "Termine di ricerca nel nome del corso") @RequestParam(required = false) String search,
            @Parameter(description = "Categoria del corso") @RequestParam(required = false) String categoria,
            @Parameter(description = "Mostra solo corsi attivi (non sospesi o annullati)") @RequestParam(required = false, defaultValue = "false") boolean soloAttivi,
            @Parameter(description = "Mostra solo corsi che richiedono feedback") @RequestParam(required = false, defaultValue = "false") boolean richiedeFeedback) {

        List<Corso> corsi;

        if (piattaformaId != null && stato != null) {
            try {
                Corso.StatoCorso statoEnum = Corso.StatoCorso.valueOf(stato.toUpperCase());
                corsi = corsoRepository.findByPiattaformaIdAndStato(piattaformaId, statoEnum);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
        } else if (piattaformaId != null) {
            corsi = corsoRepository.findByPiattaformaId(piattaformaId);
        } else if (stato != null) {
            try {
                Corso.StatoCorso statoEnum = Corso.StatoCorso.valueOf(stato.toUpperCase());
                corsi = corsoRepository.findByStato(statoEnum);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
        } else if (search != null && !search.trim().isEmpty()) {
            corsi = corsoRepository.findByNomeContainingIgnoreCase(search.trim());
        } else if (categoria != null && !categoria.trim().isEmpty()) {
            corsi = corsoRepository.findByCategoriaIgnoreCase(categoria.trim());
        } else if (soloAttivi) {
            corsi = corsoRepository.findActiveCourses();
        } else if (richiedeFeedback) {
            corsi = corsoRepository.findByFeedbackRichiestoTrue();
        } else {
            corsi = corsoRepository.findAll();
        }

        return ResponseEntity.ok(corsi);
    }*/


    @SneakyThrows
    @GetMapping(value = "/lista", produces = "application/json")
    public ResponseEntity<List<Corso>> getAllCorsi() {
        log.info("****** Otteniamo i Corsi *******");
        
        List<Corso> corsi = corsoService.SelAllCorsi();
        
        if(corsi.isEmpty()) {
            String ErrMsg = String.format("Nessun corso disponibile a sistema.");
            
            log.warning(ErrMsg);
            
            throw new NotFoundException(ErrMsg);
        }

        return new ResponseEntity<List<Corso>>(corsi, HttpStatus.OK);
    }

    @Operation(summary = "Recupera un corso per ID", description = "Restituisce i dettagli completi di un corso specifico")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Corso trovato", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Corso.class))),
            @ApiResponse(responseCode = "404", description = "Corso non trovato")
    })
    @GetMapping("/{id}")
    public ResponseEntity<Corso> getCorsoById(
            @Parameter(description = "ID del corso da recuperare", required = true) @PathVariable Long id) {

        Optional<Corso> corso = corsoRepository.findById(id);
        return corso.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Recupera un corso per codice corso", description = "Restituisce i dettagli di un corso tramite il suo codice identificativo")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Corso trovato"),
            @ApiResponse(responseCode = "404", description = "Corso non trovato")
    })
    @GetMapping("/codice/{codiceCorso}")
    public ResponseEntity<Corso> getCorsoByCodice(
            @Parameter(description = "Codice identificativo del corso", required = true) @PathVariable String codiceCorso) {

        Optional<Corso> corso = corsoRepository.findByCodiceCorso(codiceCorso);
        return corso.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Aggiorna un corso esistente", description = "Modifica i dati di un corso esistente")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Corso aggiornato con successo"),
            @ApiResponse(responseCode = "404", description = "Corso non trovato"),
            @ApiResponse(responseCode = "400", description = "Dati richiesta non validi")
    })
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCorso(
            @Parameter(description = "ID del corso da aggiornare", required = true) @PathVariable Long id,
            @Valid @RequestBody CorsoCreateRequest request) {

        Optional<Corso> optionalCorso = corsoRepository.findById(id);
        if (!optionalCorso.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        // Verifica esistenza piattaforma
        Optional<Piattaforma> piattaforma = piattaformaRepository.findById(request.getPiattaformaId());
        if (!piattaforma.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Piattaforma non trovata con ID: " + request.getPiattaformaId());
        }

        Corso corso = optionalCorso.get();
        corso.setNome(request.getNome());
        corso.setPiattaforma(piattaforma.get());
        corso.setStato(request.getStatoEnum());
        corso.setDataInizio(request.getDataInizio());
        corso.setDataFine(request.getDataFine());
        corso.setDurata(request.getDurata());
        corso.setFeedbackRichiesto(request.getFeedbackRichiesto());
        corso.setCategoria(request.getCategoria());
        corso.setArgomento(request.getArgomento());
        corso.setPriorita(request.getPriorita());
        corso.setUrlCorso(request.getUrlCorso());
        corso.setCosto(request.getCosto());
        corso.setCertificazioneRilasciata(request.getCertificazioneRilasciata());

        Corso updatedCorso = corsoRepository.save(corso);
        return ResponseEntity.ok(updatedCorso);
    }

    @Operation(summary = "Elimina un corso", description = "Rimuove un corso dal sistema (solo se non ha assegnazioni attive)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Corso eliminato con successo"),
            @ApiResponse(responseCode = "404", description = "Corso non trovato"),
            @ApiResponse(responseCode = "409", description = "Impossibile eliminare corso con assegnazioni attive")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCorso(
            @Parameter(description = "ID del corso da eliminare", required = true) @PathVariable Long id) {

        if (!corsoRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        try {
            corsoRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Impossibile eliminare il corso: potrebbe avere assegnazioni attive");
        }
    }

    @Operation(summary = "Recupera corsi per piattaforma", description = "Restituisce tutti i corsi associati a una specifica piattaforma")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista corsi recuperata con successo"),
            @ApiResponse(responseCode = "404", description = "Piattaforma non trovata")
    })
    @GetMapping("/piattaforma/{piattaformaId}")
    public ResponseEntity<List<Corso>> getCorsiByPiattaforma(
            @Parameter(description = "ID della piattaforma", required = true) @PathVariable Long piattaformaId) {

        if (!piattaformaRepository.existsById(piattaformaId)) {
            return ResponseEntity.notFound().build();
        }

        List<Corso> corsi = corsoRepository.findByPiattaformaId(piattaformaId);
        return ResponseEntity.ok(corsi);
    }
}