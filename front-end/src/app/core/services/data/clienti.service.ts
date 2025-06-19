import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { ApiMsg } from '../../../shared/models/ApiMsg';
import { IClienti } from '../../../shared/models/Clienti';

@Injectable({
  providedIn: 'root',
})
export class ClientiService {
  server: string = environment.server;
  port: string = environment.negozioServicePort;

  constructor(private httpClient: HttpClient) {}

  getListaClienti = (shopId: string) =>
    this.httpClient.get<IClienti[]>(
      `http://${this.server}:${this.port}/api/clienti/lista?shopId=${shopId}`,
    );

  insCliente = (shopId: string, cliente: IClienti) =>
    this.httpClient.post<ApiMsg>(
      `http://${this.server}:${this.port}/api/clienti/inserisci?shopId=${shopId}`,
      cliente,
    );

  updCliente = (shopId: string, cliente: IClienti) =>
    this.httpClient.put<ApiMsg>(
      `http://${this.server}:${this.port}/api/clienti/modifica?shopId=${shopId}`,
      cliente,
    );

  delCliente = (shopId: string, codiceCliente: string) =>
    this.httpClient.delete<ApiMsg>(
      `http://${this.server}:${this.port}/api/clienti/elimina/${codiceCliente}?shopId=${shopId}`,
    );
}
