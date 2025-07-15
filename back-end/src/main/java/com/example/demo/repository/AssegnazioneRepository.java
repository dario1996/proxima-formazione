package com.example.demo.repository;

import com.example.demo.entity.Assegnazione;
import com.example.demo.entity.Corso;
import com.example.demo.entity.Dipendente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AssegnazioneRepository extends JpaRepository<Assegnazione, Long> {

    // Find assignments by employee
    List<Assegnazione> findByDipendente(Dipendente dipendente);

    // Find assignments by employee ID
    List<Assegnazione> findByDipendenteId(Long dipendenteId);

    // Find assignments by course
    List<Assegnazione> findByCorso(Corso corso);

    // Find assignments by course ID
    List<Assegnazione> findByCorsoId(Long corsoId);

    // Find assignments by status
    List<Assegnazione> findByStato(Assegnazione.Stato stato);

    // Find specific assignment by employee and course
    Optional<Assegnazione> findByDipendenteAndCorso(Dipendente dipendente, Corso corso);

    // Find specific assignment by employee ID and course ID
    Optional<Assegnazione> findByDipendenteIdAndCorsoId(Long dipendenteId, Long corsoId);

    // Check if assignment already exists
    boolean existsByDipendenteIdAndCorsoId(Long dipendenteId, Long corsoId);

    // New methods for the new fields
    List<Assegnazione> findByEsito(Assegnazione.Esito esito);
    List<Assegnazione> findByModalita(String modalita);
    List<Assegnazione> findByAttestatoTrue();
    List<Assegnazione> findByFonteRichiesta(String fonteRichiesta);
    List<Assegnazione> findByStatoAndEsito(Assegnazione.Stato stato, Assegnazione.Esito esito);

    // Custom queries
    @Query("SELECT a FROM Assegnazione a WHERE a.dataTerminePrevista < :oggi AND a.stato != 'TERMINATO' AND a.stato != 'INTERROTTO'")
    List<Assegnazione> findAssegnazioniInRitardo(@Param("oggi") LocalDate oggi);

    @Query("SELECT a FROM Assegnazione a WHERE a.attestato = true AND a.stato = 'TERMINATO'")
    List<Assegnazione> findAssegnazioniConAttestato();
}