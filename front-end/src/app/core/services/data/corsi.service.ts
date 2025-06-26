import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ICorsi } from '../../../shared/models/Corsi';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class CorsiService {
  server: string = environment.server;
  port: string = environment.port;

  constructor(private httpClient: HttpClient) {}

  getListaCorsi = () =>
    this.httpClient.get<ICorsi[]>(
      `http://${this.server}:${this.port}/api/corsi/lista`,
    );

}