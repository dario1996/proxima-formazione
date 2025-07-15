import { IDipendenti } from './Dipendenti';
import { ICorsi } from './Corsi';

export interface IAssegnazione {
  id: number;
  corso: ICorsi;
  dipendente: IDipendenti;
  dataAssegnazione: string;
  modalita: string;
  stato: string
  dataTerminePrevista: string;
  dataInizio: string;
  dataFine: string;
  statoCorso: string;
  percentualeCompletamento: number;
  attestato: boolean;
  fonteRichiesta: string;
  dataCreazione: string;
  dataModifica: string;
}

export enum AssegnazioneStato {
  ASSEGNATO = 'ASSEGNATO',
  IN_CORSO = 'IN_CORSO',
  COMPLETATO = 'COMPLETATO',
  NON_INIZIATO = 'NON_INIZIATO',
  SOSPESO = 'SOSPESO',
  ANNULLATO = 'ANNULLATO',
}

export interface AssegnazioneCreateRequest {
  dipendenteId: number;
  corsoId: number;
  obbligatorio?: boolean;
}

export interface AssegnazioneUpdateRequest {
  stato?: AssegnazioneStato;
  percentualeCompletamento: number;
  oreCompletate?: number;
  attestato?: boolean;
}
