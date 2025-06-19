import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { ApiMsg } from '../../../shared/models/ApiMsg';
import { IServizi } from '../../../shared/models/Servizi';

@Injectable({
  providedIn: 'root',
})
export class ServiziService {
  server: string = environment.server;
  port: string = environment.negozioServicePort;

  constructor(private httpClient: HttpClient) {}

  getListaServizi = (shopId: string) =>
    this.httpClient.get<IServizi[]>(
      `http://${this.server}:${this.port}/api/servizi/lista?shopId=${shopId}`,
    );

  insServizio = (shopId: string, servizio: IServizi) =>
    this.httpClient.post<ApiMsg>(
      `http://${this.server}:${this.port}/api/servizi/inserisci?shopId=${shopId}`,
      servizio,
    );

  updServizio = (shopId: string, servizio: IServizi) =>
    this.httpClient.put<ApiMsg>(
      `http://${this.server}:${this.port}/api/servizi/modifica?shopId=${shopId}`,
      servizio,
    );

  delServizio = (shopId: string, serviceCode: string) =>
    this.httpClient.delete<ApiMsg>(
      `http://${this.server}:${this.port}/api/servizi/elimina/${serviceCode}?shopId=${shopId}`,
    );
}
