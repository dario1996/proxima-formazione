-- SQL script to fix enum case sensitivity issues in the database

-- Fix StatoAssegnazione enum values (convert to new Italian values)
UPDATE assegnazioni SET stato = 'DA_INIZIARE' WHERE stato IN ('ASSEGNATO', 'Assegnato', 'NON_INIZIATO', 'Non_iniziato', 'Non iniziato');
UPDATE assegnazioni SET stato = 'IN_CORSO' WHERE stato IN ('IN_CORSO', 'In_corso', 'In corso');
UPDATE assegnazioni SET stato = 'TERMINATO' WHERE stato IN ('COMPLETATO', 'Completato', 'TERMINATO', 'Terminato');
UPDATE assegnazioni SET stato = 'INTERROTTO' WHERE stato IN ('SOSPESO', 'Sospeso', 'ANNULLATO', 'Annullato', 'INTERROTTO', 'Interrotto');

-- Fix StatoCorso enum values (convert to uppercase)
UPDATE corsi SET stato = 'PIANIFICATO' WHERE stato = 'Pianificato';
UPDATE corsi SET stato = 'ATTIVO' WHERE stato = 'Attivo';
UPDATE corsi SET stato = 'IN_CORSO' WHERE stato = 'In_corso' OR stato = 'In corso';
UPDATE corsi SET stato = 'COMPLETATO' WHERE stato = 'Completato';
UPDATE corsi SET stato = 'SOSPESO' WHERE stato = 'Sospeso';
UPDATE corsi SET stato = 'ANNULLATO' WHERE stato = 'Annullato';
UPDATE corsi SET stato = 'SCADUTO' WHERE stato = 'Scaduto';

-- Verify the changes
SELECT DISTINCT stato FROM assegnazioni;
SELECT DISTINCT stato FROM corsi;
