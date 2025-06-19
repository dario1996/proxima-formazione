import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { IProdotti } from '../../../shared/models/Prodotti';
import { ApiMsg } from '../../../shared/models/ApiMsg';

@Injectable({
  providedIn: 'root',
})
export class ScannerProdottiService {
  server: string = environment.server;
  port: string = environment.magazzinoServicePort;

  constructor(private httpClient: HttpClient) {}

  checkProdotto = (shopId: string, codiceProdotto: string) =>
    this.httpClient.get<boolean>(
      `http://${this.server}:${this.port}/api/scanner/check?shopId=${shopId}&codiceProdotto=${codiceProdotto}`,
    );

  insProdotto = (shopId: string, prodotto: IProdotti) =>
    this.httpClient.post<ApiMsg>(
      `http://${this.server}:${this.port}/api/scanner/inserisci?shopId=${shopId}`,
      prodotto,
    );
}
