import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton, IonButton, IonIcon } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { addIcons } from 'ionicons';
import { language } from 'ionicons/icons';

@Component({
  selector: 'app-tab5',
  templateUrl: 'tab5.page.html',
  styleUrls: ['tab5.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton, IonButton, IonIcon, ExploreContainerComponent]
})
export class Tab5Page {
  currentLanguage = 'EN';

  constructor() {
    addIcons({ language });
  }

  toggleLanguage() {
    this.currentLanguage = this.currentLanguage === 'EN' ? 'ES' : 'EN';
    console.log('Language changed to:', this.currentLanguage);
  }
}
