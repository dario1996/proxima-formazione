import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { INegozi } from '../../../shared/models/Negozi';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class NegoziService {
  server: string = environment.server;
  port: string = environment.portUser;

  private negozioSelezionato = new BehaviorSubject<INegozi | null>(null);
  public readonly negozioSelezionato$ = this.negozioSelezionato.asObservable();

  private negoziDisponibili$ = new BehaviorSubject<INegozi[]>([]);

  constructor(private http: HttpClient) {}

  caricaNegozi() {
    const username = sessionStorage.getItem('Utente');
    if (!username) return;

    this.http
      .get<
        INegozi[]
      >(`http://${this.server}:${this.port}/api/negozi/${username}`)
      .subscribe(negozi => {
        this.negoziDisponibili$.next(negozi);
        if (negozi.length > 0) {
          this.switchNegozio(negozi[0]); // Imposta il primo negozio come predefinito
        }
      });
  }

  switchNegozio(negozio: INegozi) {
    this.negozioSelezionato.next(negozio);
  }

  getNegozioCorrente(): Observable<INegozi | null> {
    return this.negozioSelezionato$;
  }

  getNegoziDisponibili(): Observable<INegozi[]> {
    return this.negoziDisponibili$.asObservable();
  }
}
