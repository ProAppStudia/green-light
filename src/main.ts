import { bootstrapApplication } from '@angular/platform-browser';
import {
  provideRouter,
  withPreloading,
  PreloadAllModules
} from '@angular/router';

import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  pricetagsOutline,
  cartOutline,
  qrCodeOutline,
  personOutline
} from 'ionicons/icons';

import {
  provideHttpClient,
  withInterceptorsFromDi,
  HttpClient
} from '@angular/common/http';

import { importProvidersFrom } from '@angular/core';

import {
  TranslateModule,
  provideTranslateService,
  TranslateLoader
} from '@ngx-translate/core';

import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { AuthInterceptor } from './app/interceptors/auth.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable } from 'rxjs';

// icons
addIcons({
  'pricetags-outline': pricetagsOutline,
  'cart-outline': cartOutline,
  'qr-code-outline': qrCodeOutline,
  'person-outline': personOutline,
});

export function createTranslateLoader(http: HttpClient): TranslateLoader {
  return {
    getTranslation: (lang: string): Observable<any> => {
      // шлях до файлів локалізації
      return http.get(`/assets/i18n/${lang}.json`);
    }
  } as TranslateLoader;
}

bootstrapApplication(AppComponent, {
  providers: [
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(withInterceptorsFromDi()),

    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },

    // NGX-TRANSLATE PROVIDERS
    provideTranslateService(),

    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: createTranslateLoader,
          deps: [HttpClient]
        }
      })
    ),
  ],
});

/*import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { pricetagsOutline, cartOutline, qrCodeOutline, personOutline } from 'ionicons/icons';
import { HttpClientModule, provideHttpClient, withInterceptorsFromDi  } from '@angular/common/http';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

import { AuthInterceptor } from './app/interceptors/auth.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';


// Register the icons
addIcons({
  'pricetags-outline': pricetagsOutline,
  'cart-outline': cartOutline,
  'qr-code-outline': qrCodeOutline,
  'person-outline': personOutline,
});

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(withInterceptorsFromDi()),
{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },	
  ],
});
*/