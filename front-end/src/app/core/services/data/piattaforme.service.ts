import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
// import { ApiMsg } from '../../../shared/models/ApiMsg';
import { IPiattaforma } from '../../../shared/models/Piattaforma';

@Injectable({
  providedIn: 'root',
})
export class PiattaformeService {
  server: string = environment.server;
  port: string = environment.port;

  constructor(private httpClient: HttpClient) {}

  getListaPiattaforme = () =>
    this.httpClient.get<IPiattaforma[]>(
      `http://${this.server}:${this.port}/api/piattaforme/lista`,
    );

  //   insCliente = (shopId: string, cliente: IClienti) =>
  //     this.httpClient.post<ApiMsg>(
  //       `http://${this.server}:${this.port}/api/clienti/inserisci?shopId=${shopId}`,
  //       cliente,
  //     );

  //   updCliente = (shopId: string, cliente: IClienti) =>
  //     this.httpClient.put<ApiMsg>(
  //       `http://${this.server}:${this.port}/api/clienti/modifica?shopId=${shopId}`,
  //       cliente,
  //     );

  //   delCliente = (shopId: string, codiceCliente: string) =>
  //     this.httpClient.delete<ApiMsg>(
  //       `http://${this.server}:${this.port}/api/clienti/elimina/${codiceCliente}?shopId=${shopId}`,
  //     );

  addPiattaforma(piattaforma: any) {
    // Da implementare: chiamata POST all'API
    return { subscribe: (cb: any) => cb() }; // placeholder
  }

  editPiattaforma(piattaforma: any) {
    // Da implementare: chiamata PUT/PATCH all'API
    return { subscribe: (cb: any) => cb() }; // placeholder
  }

  deletePiattaforma(id: any) {
    // Da implementare: chiamata DELETE all'API
    return { subscribe: (cb: any) => cb() }; // placeholder
  }
}
