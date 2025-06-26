import { HttpClient, HttpHeaders } from '@angular/common/http';

import { AppCookieService } from './app-cookie.service';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Token } from '../../shared/models/Token';
import { environment } from '../../../environments/environment.development';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthJwtService {
  server: string = environment.server;
  private helper = new JwtHelperService();
  //port: string = environment.negozioServicePort;

  constructor(
    private httpClient: HttpClient,
    private storageService: AppCookieService,
  ) {}

  autenticaService(username: string, password: string) {
    return this.httpClient
      .post<Token>(`${environment.authServerUri}`, { username, password })
      .pipe(
        map(data => {
          sessionStorage.setItem('Utente', username);
          //sessionStorage.setItem("AuthToken", `Bearer ${data.token}`);
          this.storageService.set('AuthToken', data.token);
          return data;
        }),
      );
  }

  refreshToken = (token: string) => {
    console.log('Esecuzione Refresh Token');

    return this.httpClient
      .get<Token>(`${environment.authServerUri}`, {
        headers: new HttpHeaders({ Authorization: token }),
      })
      .pipe(
        map(data => {
          this.storageService.set('AuthToken', data.token);
          return data;
        }),
      );
  };

  getAuthToken = (): string => {
    let AuthHeader: string | null = '';
    //AuthHeader = sessionStorage.getItem("AuthToken");
    AuthHeader = this.storageService.get('AuthToken');

    return AuthHeader ? AuthHeader : '';
  };

  isTokenExpired = (): boolean => {
    const token = this.getAuthToken();
    if (!token) {
      return true;
    }

    try {
      return this.helper.isTokenExpired(token);
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  };

  loggedUser = (): string | null =>
    sessionStorage.getItem('Utente') ? sessionStorage.getItem('Utente') : '';

  isLogged = (): boolean => {
    const userLogged = sessionStorage.getItem('Utente');
    const tokenExists = this.getAuthToken();

    // User is logged if they have a session AND a non-expired token
    return userLogged ? !this.isTokenExpired() : false;
  };

  clearUser = (): void => sessionStorage.removeItem('Utente');

  clearAll = (): void => {
    this.storageService.clear();
    sessionStorage.clear();
  };
}
