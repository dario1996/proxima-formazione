export interface IDipendenti {
  id: number;
  nome: string;
  cognome: string;
  email: string;
  commerciale: string;
  azienda: string;
  ruolo: string;
  reparto: string;
  dataAssunzione: string;
  codiceDipendente: string;
  attivo: boolean;
  dataCreazione: string;
  dataModifica: string;
}

export interface DipendenteCreateRequest {
  nome: string;
  cognome: string;
  email: string;
  codiceDipendente: string;
  reparto: string;
  commerciale: string;
  azienda: string;
  ruolo: string;
}
