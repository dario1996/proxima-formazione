import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppCookieService } from '../core/services/app-cookie.service';
import { AuthJwtService } from '../core/services/authJwt.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private auth: AuthJwtService,
    private storageService: AppCookieService,
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    const token = this.storageService.get('AuthToken');

    if (token && this.auth.loggedUser()) {
      const authReq = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token.replace(/^Bearer\s+/, '')}`,
        },
      });
      return next.handle(authReq);
    }

    return next.handle(request);
  }
}
