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
  port: string = environment.port;

  constructor(private httpClient: HttpClient) {}

  getListaDipendenti = () =>
    this.httpClient.get<IDipendenti[]>(
      `http://${this.server}:${this.port}/api/dipendenti`,
    );

  insDipendente = (dipendente: IDipendenti) =>
    this.httpClient.post<ApiMsg>(
      `http://${this.server}:${this.port}/api/dipendenti`,
      dipendente,
    );

  updDipendente = (dipendente: IDipendenti) =>
    this.httpClient.put<ApiMsg>(
      `http://${this.server}:${this.port}/api/dipendenti/${dipendente.id}`,
      dipendente,
    );

  delDipendente = (id: number) =>
    this.httpClient.delete<ApiMsg>(
      `http://${this.server}:${this.port}/api/dipendenti/${id}`,
    );
}
