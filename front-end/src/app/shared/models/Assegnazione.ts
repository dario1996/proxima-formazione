import { IDipendenti } from './Dipendenti';
import { ICorsi } from './Corsi';

export interface IAssegnazione {
  id: number;
  dipendente: IDipendenti;
  corso: ICorsi;
  dataAssegnazione: string;
  dataInizio: string;
  dataCompletamento: string;
  percentualeCompletamento: number;
  oreCompletate: number;
  stato: AssegnazioneStato;
  obbligatorio: boolean;
  feedbackFornito: boolean;
  valutazione: number;
  noteFeedback: string;
  competenzeAcquisite: string;
  certificatoOttenuto: boolean;
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
  percentualeCompletamento?: number;
  oreCompletate?: number;
  feedbackFornito?: boolean;
  valutazione?: number;
  noteFeedback?: string;
  competenzeAcquisite?: string;
  certificatoOttenuto?: boolean;
}
