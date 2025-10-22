import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton, IonButton, IonIcon } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { addIcons } from 'ionicons';
import { language } from 'ionicons/icons';

import { Preferences } from '@capacitor/preferences';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton, IonButton, IonIcon, ExploreContainerComponent],
})
export class Tab4Page {
  currentLanguage = 'EN';

  constructor(
    private router: Router
  ) {
    addIcons({ language });
  }

  async ngOnInit() {
    const { value: token } = await Preferences.get({ key: 'auth_token' });
    
    if (!token) {
      this.router.navigate(['/auth'], { replaceUrl: true });
    }
  }

  toggleLanguage() {
    this.currentLanguage = this.currentLanguage === 'EN' ? 'ES' : 'EN';
    console.log('Language changed to:', this.currentLanguage);
  }
}
