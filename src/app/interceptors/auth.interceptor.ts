import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Preferences } from '@capacitor/preferences';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(Preferences.get({ key: 'auth_token' })).pipe(
      switchMap(({ value: token }) => {
        if (token && token != 'undefined') {
          req = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` },
          });
        }else if(token == 'undefined'){
          /*токен помер, видалимо його для уникнення проблем отримання інформації авторизованим*/
          Preferences.remove({ key: 'auth_token' });
        }
        return next.handle(req);
      })
    );
  }
}
