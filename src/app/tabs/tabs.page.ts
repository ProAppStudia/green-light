import { Component, EnvironmentInjector, inject } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { pricetagsOutline, cartOutline, qrCodeOutline, personOutline, rocketOutline } from 'ionicons/icons';
import { AuthService } from 'src/app/services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: true,
  imports: [TranslateModule, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
})
export class TabsPage {
  public environmentInjector = inject(EnvironmentInjector);

  constructor(
    private translate: TranslateService,
    private auth: AuthService
  ) {
    addIcons({ pricetagsOutline, cartOutline, qrCodeOutline, personOutline, rocketOutline });
  }

  ngOnInit(){
    this.auth.getLanguage().then(lang_code => {
      if (lang_code !== null) {
        this.translate.use(lang_code);
      }else{
        this.translate.use('ua');
      }
    });
  }

}
