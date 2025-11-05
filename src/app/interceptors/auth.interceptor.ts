import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable, from, forkJoin, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { Preferences } from '@capacitor/preferences';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // Зчитуємо токен, мову і країну одночасно
    const token$ = from(Preferences.get({ key: 'auth_token' }));
    const lang$ = from(Preferences.get({ key: 'language' }));
    const country$ = from(Preferences.get({ key: 'country' }));

    return forkJoin([token$, lang$, country$]).pipe(
      switchMap(([tokenRes, langRes, countryRes]) => {
        let modifiedReq = req;

        const headers: Record<string, string> = {};

        // Токен
        const token = tokenRes.value;
        if (token && token !== 'undefined') {
          headers['Authorization'] = `Bearer ${token}`;
        } else if (token === 'undefined') {
          Preferences.remove({ key: 'auth_token' });
        }

        // Мова і країна
        const lang = langRes.value;
        const country = countryRes.value;
        if (lang) headers['X-Language'] = lang;
        if (country) headers['X-Country'] = country;

        // Клонуємо запит з оновленими заголовками
        modifiedReq = modifiedReq.clone({
          setHeaders: headers,
        });

        return next.handle(modifiedReq);
      }),
      catchError(err => {
        console.error('❌ AuthInterceptor error:', err);
        return next.handle(req); // навіть у разі помилки пропускаємо запит
      })
    );
  }
}


/*
*
* FIRST version with auth token
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
          //токен помер, видалимо його для уникнення проблем отримання інформації авторизованим
          Preferences.remove({ key: 'auth_token' });
        }
        return next.handle(req);
      })
    );
  }
}

*/