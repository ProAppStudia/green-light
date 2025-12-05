import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { home, person, settings, star, helpCircle, informationCircle } from 'ionicons/icons';
import { SideMenuComponent } from './components/side-menu/side-menu.component';

import { StatusBar, Style } from '@capacitor/status-bar';
import { Platform } from '@ionic/angular';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonIcon, IonLabel, SideMenuComponent],
})
export class AppComponent {
  constructor(private platform: Platform) {
    addIcons({ home, person, settings, star, helpCircle, informationCircle });
    this.initializeApp();
  }

  async initializeApp() {
    await this.platform.ready();

    // Статусбар НЕ перекриває контент
    await StatusBar.setOverlaysWebView({ overlay: false });

    // Опціонально — зробити темний або світлий текст
    await StatusBar.setStyle({ style: Style.Dark });
  }

}
