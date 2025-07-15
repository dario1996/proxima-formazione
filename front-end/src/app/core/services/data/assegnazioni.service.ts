import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import {
  IAssegnazione,
  AssegnazioneCreateRequest,
  AssegnazioneUpdateRequest,
  AssegnazioneStato,
} from '../../../shared/models/Assegnazione';

@Injectable({
  providedIn: 'root',
})
export class AssegnazioniService {
  server: string = environment.server;
  port: string = environment.port;

  constructor(private httpClient: HttpClient) {}

  // Assegna un corso a un dipendente
  assignCorsoToDipendente = (
    dipendenteId: number,
    corsoId: number,
    obbligatorio: boolean = false,
  ) =>
    this.httpClient.post<IAssegnazione>(
      `http://${this.server}:${this.port}/api/dipendenti/${dipendenteId}/corsi/${corsoId}`,
      {},
      { params: { obbligatorio: obbligatorio.toString() } },
    );

  // Recupera tutte le assegnazioni di un dipendente
  getAssegnazionesByDipendente = (dipendenteId: number) =>
    this.httpClient.get<IAssegnazione[]>(
      `http://${this.server}:${this.port}/api/dipendenti/${dipendenteId}/assegnazioni`,
    );

  // Recupera tutte le assegnazioni di un corso
  getAssegnazioniByCorso = (corsoId: number) =>
    this.httpClient.get<IAssegnazione[]>(
      `http://${this.server}:${this.port}/api/corsi/${corsoId}/assegnazioni`,
    );

  // Recupera una specifica assegnazione
  getAssegnazioneById = (assegnazioneId: number) =>
    this.httpClient.get<IAssegnazione>(
      `http://${this.server}:${this.port}/api/assegnazioni/${assegnazioneId}`,
    );

  // Aggiorna lo stato di un'assegnazione
  updateAssegnazioneStato = (
    assegnazioneId: number,
    stato: AssegnazioneStato,
  ) =>
    this.httpClient.put<IAssegnazione>(
      `http://${this.server}:${this.port}/api/assegnazioni/${assegnazioneId}/stato`,
      null,
      { params: { stato: stato } },
    );

  // Aggiorna un'assegnazione completa
  updateAssegnazione = (
    assegnazioneId: number,
    updateData: AssegnazioneUpdateRequest,
  ) => {
    const params: any = {};

    if (updateData.stato !== undefined) params.stato = updateData.stato;
    if (updateData.percentualeCompletamento !== undefined)
      params.percentualeCompletamento =
        updateData.percentualeCompletamento.toString();
    if (updateData.oreCompletate !== undefined)
      params.oreCompletate = updateData.oreCompletate.toString();
    if (updateData.attestato !== undefined)
      params.attestato = updateData.attestato.toString();

    return this.httpClient.put<IAssegnazione>(
      `http://${this.server}:${this.port}/api/assegnazioni/${assegnazioneId}`,
      null,
      { params },
    );
  };

  // Recupera tutte le assegnazioni con filtri
  getAllAssegnazioni = (
    stato?: AssegnazioneStato,
    soloObbligatorie: boolean = false,
    richiedeFeedback: boolean = false,
  ) =>
    this.httpClient.get<IAssegnazione[]>(
      `http://${this.server}:${this.port}/api/assegnazioni`,
      {
        params: {
          ...(stato && { stato }),
          soloObbligatorie: soloObbligatorie.toString(),
          richiedeFeedback: richiedeFeedback.toString(),
        },
      },
    );

  // Elimina un'assegnazione
  deleteAssegnazione = (assegnazioneId: number) =>
    this.httpClient.delete<void>(
      `http://${this.server}:${this.port}/api/assegnazioni/${assegnazioneId}`,
    );

  // Metodi di utilità per le statistiche
  getAssegnazioniStats = () =>
    this.httpClient.get<any>(
      `http://${this.server}:${this.port}/api/assegnazioni/stats`,
    );
}
