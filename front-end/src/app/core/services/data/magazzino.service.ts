import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { IProdotti } from '../../../shared/models/Prodotti';
import { ApiMsg } from '../../../shared/models/ApiMsg';

@Injectable({
  providedIn: 'root',
})
export class MagazzinoService {
  server: string = environment.server;
  port: string = environment.magazzinoServicePort;

  constructor(private httpClient: HttpClient) {}

  getListaProdotti = (shopId: string) =>
    this.httpClient.get<IProdotti[]>(
      `http://${this.server}:${this.port}/api/magazzino/lista?shopId=${shopId}`,
    );

  updProdotto = (shopId: string, prodotto: IProdotti) =>
    this.httpClient.put<ApiMsg>(
      `http://${this.server}:${this.port}/api/magazzino/modifica?shopId=${shopId}`,
      prodotto,
    );
}
