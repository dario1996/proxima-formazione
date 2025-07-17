import { IPiattaforma } from "./Piattaforma";

export interface ICorsi {
    id: number;
    nome: string;
    categoria: string;
    argomento: string;
    modulo: string;
    formatiRichiedenti: string;
    impattoIsms: boolean;
    durata: number;
    dataInizio: string;
    dataFine: string;
    dataScadenza: string;
    ore: number;
    oreRimanenti: number;
    stato: string;
    priorita: string;
    codiceCorso: string;
    idContenutoLinkedin: string;
    urlCorso: string;
    costo: number;
    certificazioneRilasciata: boolean;
    feedbackRichiesto: boolean;
    dataCreazione: string;
    dataModifica: string;
    piattaforma: IPiattaforma;
    piattaformaNome?: string;
    impattoIsmsLabel?: string; // Per visualizzare "Si" o "No"
}