package com.example.demo.controller;

import com.example.demo.entity.Piattaforma;
import com.example.demo.exceptions.NotFoundException;
import com.example.demo.repository.PiattaformaRepository;
import com.example.demo.services.PiattaformeService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.SneakyThrows;
import lombok.extern.java.Log;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@Log
@RestController
@RequestMapping("/api/piattaforme")
@CrossOrigin(origins = "*")
@Tag(name = "Piattaforme", description = "Gestione delle piattaforme di formazione")
public class PiattaformaController {

    @Autowired
    private PiattaformaRepository piattaformaRepository;

    @Autowired
    private PiattaformeService piattaformeService;

    @Operation(summary = "Recupera tutte le piattaforme", description = "Restituisce l'elenco completo delle piattaforme di formazione registrate")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista piattaforme recuperata con successo", content = @Content(mediaType = "application/json", schema = @Schema(type = "array", implementation = Piattaforma.class)))
    })
    // @GetMapping
    // public List<Piattaforma> getAllPiattaforme() {
    //     return piattaformaRepository.findAll();
    // }

    @SneakyThrows
    @GetMapping(value = "/lista", produces = "application/json")
    public ResponseEntity<List<Piattaforma>> getAllPiattaforme() {
        log.info("****** Otteniamo le Piattaforme *******");

        List<Piattaforma> piattaforme = piattaformeService.SelAllPiattaforme();

        if (piattaforme.isEmpty()) {
            String ErrMsg = String.format("Nessuna piattaforma disponibile a sistema.");

            log.warning(ErrMsg);

            throw new NotFoundException(ErrMsg);
        }

        return new ResponseEntity<List<Piattaforma>>(piattaforme, HttpStatus.OK);
    }

    // GET platform by ID
    @GetMapping("/{id}")
    public ResponseEntity<Piattaforma> getPiattaformaById(@PathVariable Long id) {
        Optional<Piattaforma> piattaforma = piattaformaRepository.findById(id);
        return piattaforma.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST create new platform
    @PostMapping
    public Piattaforma createPiattaforma(@RequestBody Piattaforma piattaforma) {
        return piattaformaRepository.save(piattaforma);
    }

    // PUT update platform
    @PutMapping("/{id}")
    public ResponseEntity<Piattaforma> updatePiattaforma(@PathVariable Long id,
            @RequestBody Piattaforma piattaformaDetails) {
        Optional<Piattaforma> optionalPiattaforma = piattaformaRepository.findById(id);

        if (optionalPiattaforma.isPresent()) {
            Piattaforma piattaforma = optionalPiattaforma.get();
            piattaforma.setNome(piattaformaDetails.getNome());
            piattaforma.setDescrizione(piattaformaDetails.getDescrizione());
            piattaforma.setUrlSito(piattaformaDetails.getUrlSito());
            piattaforma.setAttiva(piattaformaDetails.getAttiva());

            Piattaforma updatedPiattaforma = piattaformaRepository.save(piattaforma);
            return ResponseEntity.ok(updatedPiattaforma);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE platform
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePiattaforma(@PathVariable Long id) {
        if (piattaformaRepository.existsById(id)) {
            piattaformaRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // GET active platforms only
    @GetMapping("/active")
    public List<Piattaforma> getActivePiattaforme() {
        return piattaformaRepository.findByAttivaTrue();
    }
}