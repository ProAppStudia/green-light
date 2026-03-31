import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { home, person, settings, star, helpCircle, informationCircle } from 'ionicons/icons';
import { SideMenuComponent } from './components/side-menu/side-menu.component';

import { StatusBar, Style } from '@capacitor/status-bar';
import { Platform } from '@ionic/angular';
import { App } from '@capacitor/app';
import { RealtimeService } from './services/realtime.service';
import { PushService } from './services/push.service';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonIcon, IonLabel, SideMenuComponent],
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private realtimeService: RealtimeService,
    private pushService: PushService,
  ) {
    addIcons({ home, person, settings, star, helpCircle, informationCircle });
    this.initializeApp();
  }

  async initializeApp() {
    await this.platform.ready();

    // iOS: хедер заходить під статус-бар (header extends to top),
    // safe-area-inset-top в CSS відсуває контент нижче іконок статус-бару.
    // Android: статус-бар НЕ перекриває контент, задаємо колір фону.
    if (this.platform.is('ios')) {
      await StatusBar.setOverlaysWebView({ overlay: true });
    } else {
      await StatusBar.setOverlaysWebView({ overlay: false });
      await StatusBar.setBackgroundColor({ color: '#3a3a3a' });
    }

    // Світлі іконки статус-бару (для темного фону)
    await StatusBar.setStyle({ style: Style.Light });

    await this.pushService.initialize();
    await this.realtimeService.connect();

    App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        void this.pushService.syncToken();
        void this.realtimeService.connect();
        return;
      }

      this.realtimeService.disconnect();
    });
  }

}
