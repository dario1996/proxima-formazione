import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { IDipendenti } from '../../../shared/models/Dipendenti';
import { ApiMsg } from '../../../shared/models/ApiMsg';
import { IVendite } from '../../../shared/models/Vendite';
import { IVenditePage } from '../../../shared/models/VenditePage';

@Injectable({
  providedIn: 'root',
})
export class VenditeService {
  server: string = environment.server;
  port: string = environment.venditeServicePort;

  constructor(private httpClient: HttpClient) {}

  insVendita = (shopId: string, vendita: IVendite) =>
    this.httpClient.post<ApiMsg>(
      `http://${this.server}:${this.port}/api/vendite/inserisci?shopId=${shopId}`,
      vendita,
    );

  getProdottiVendutiOggi = (shopId: string) =>
    this.httpClient.get<number>(
      `http://${this.server}:${this.port}/api/vendite/prodotti-venduti-oggi?shopId=${shopId}`,
    );

  getArchivio = (
    shopId: string,
    page: number,
    size: number,
    dataInizio?: string,
    dataFine?: string,
    cliente?: string,
    operatore?: string,
    validita?: string,
  ) => {
    let params = `shopId=${shopId}&page=${page - 1}&size=${size}`;
    if (dataInizio) params += `&dataInizio=${dataInizio}`;
    if (dataFine) params += `&dataFine=${dataFine}`;
    if (cliente) params += `&cliente=${encodeURIComponent(cliente)}`;
    if (operatore) params += `&operatore=${encodeURIComponent(operatore)}`;
    if (validita) params += `&validita=${validita}`;
    return this.httpClient.get<IVenditePage>(
      `http://${this.server}:${this.port}/api/vendite/archivio?${params}`,
    );
  };

  getRegistroGiornaliero = (shopId: string, page: number, size: number) =>
    this.httpClient.get<IVenditePage>(
      `http://${this.server}:${this.port}/api/vendite/registro-giornaliero?shopId=${shopId}&page=${page - 1}&size=${size}`,
    );
}
