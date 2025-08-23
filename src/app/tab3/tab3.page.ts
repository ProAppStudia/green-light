import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton, IonButton, IonIcon } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { addIcons } from 'ionicons';
import { language } from 'ionicons/icons';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton, IonButton, IonIcon, ExploreContainerComponent],
})
export class Tab3Page {
  currentLanguage = 'EN';

  constructor() {
    addIcons({ language });
  }

  toggleLanguage() {
    this.currentLanguage = this.currentLanguage === 'EN' ? 'ES' : 'EN';
    console.log('Language changed to:', this.currentLanguage);
  }
}
