import { bootstrapApplication } from '@angular/platform-browser';
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
