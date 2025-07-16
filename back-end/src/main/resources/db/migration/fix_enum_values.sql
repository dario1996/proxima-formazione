-- Migration script to fix invalid enum values in the database

-- Update any courses with invalid stato values to use valid enum values
UPDATE corsi SET stato = 'ATTIVO' WHERE stato NOT IN ('PIANIFICATO', 'ATTIVO', 'IN_CORSO', 'COMPLETATO', 'SOSPESO', 'ANNULLATO', 'SCADUTO');

-- Update any assignments with invalid stato values to use valid enum values  
UPDATE assegnazioni SET stato = 'ASSEGNATO' WHERE stato NOT IN ('ASSEGNATO', 'IN_CORSO', 'COMPLETATO', 'NON_INIZIATO', 'SOSPESO', 'ANNULLATO');

-- Add default values for new fields in existing records
UPDATE assegnazioni SET 
    esito = NULL,
    fonte_richiesta = NULL,
    impatto_isms = NULL,
    attestato = NULL
WHERE esito IS NULL AND fonte_richiesta IS NULL AND impatto_isms IS NULL AND attestato IS NULL;
