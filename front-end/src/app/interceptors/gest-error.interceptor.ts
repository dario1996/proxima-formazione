/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

import { AuthJwtService } from '../core/services/authJwt.service';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class GestErrorInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private auth: AuthJwtService,
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError(err => {
        console.log(err);

        let error: string =
          err.status > 0
            ? err.error.message || err.statusText
            : 'Errore Generico. Impossibile Proseguire!';

        if ([403].indexOf(err.status) !== -1) {
          this.router.navigate(['forbidden']);
        }
        if ([401].indexOf(err.status) !== -1 && this.auth.isLogged()) {
          this.auth.clearAll();
          this.router.navigate(['login'], { queryParams: { expired: true } });
        } else if (err.status === 404) {
          error = err.error.message;
        }

        return throwError(() => error);
      }),
    );
  }
}
