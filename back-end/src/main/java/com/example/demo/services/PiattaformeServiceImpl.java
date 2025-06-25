package com.example.demo.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.entity.Piattaforma;
import com.example.demo.repository.PiattaformaRepository;

@Service
public class PiattaformeServiceImpl implements PiattaformeService {

    @Autowired
    private PiattaformaRepository piattaformaRepository;

    @Override
    public List<Piattaforma> SelAllPiattaforme() {
        return piattaformaRepository.findAll();
    }

    // Implementazione dei metodi del servizio per gestire le piattaforme
    // Ad esempio, potresti avere metodi per ottenere tutte le piattaforme,
    // aggiungere una nuova piattaforma, aggiornare o eliminare una piattaforma.

    // Esempio di metodo per ottenere tutte le piattaforme
    // public List<Piattaforma> getAllPiattaforme() {
    //     return piattaformaRepository.findAll();
    // }
    
}
