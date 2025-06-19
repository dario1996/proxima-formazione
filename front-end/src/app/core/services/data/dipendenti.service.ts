import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { IDipendenti } from '../../../shared/models/Dipendenti';
import { ApiMsg } from '../../../shared/models/ApiMsg';

@Injectable({
  providedIn: 'root',
})
export class DipendentiService {
  server: string = environment.server;
  port: string = environment.negozioServicePort;

  constructor(private httpClient: HttpClient) {}

  getListaDipendenti = (shopId: string) =>
    this.httpClient.get<IDipendenti[]>(
      `http://${this.server}:${this.port}/api/dipendenti/lista?shopId=${shopId}`,
    );

  insDipendente = (shopId: string, dipendente: IDipendenti) =>
    this.httpClient.post<ApiMsg>(
      `http://${this.server}:${this.port}/api/dipendenti/inserisci?shopId=${shopId}`,
      dipendente,
    );

  updDipendente = (shopId: string, dipendente: IDipendenti) =>
    this.httpClient.put<ApiMsg>(
      `http://${this.server}:${this.port}/api/dipendenti/modifica?shopId=${shopId}`,
      dipendente,
    );

  delDipendente = (shopId: string, codiceDipendente: string) =>
    this.httpClient.delete<ApiMsg>(
      `http://${this.server}:${this.port}/api/dipendenti/elimina/${codiceDipendente}?shopId=${shopId}`,
    );
}
