import { Component, OnInit } from '@angular/core';
import { IonItem, IonList, IonPopover, IonLabel, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton, IonButton, IonIcon,MenuController } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { addIcons } from 'ionicons';
import { addOutline, chevronForwardOutline, language, languageOutline, logInOutline, mapOutline, menuOutline, notifications, notificationsOutline, removeOutline } from 'ionicons/icons';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ApiService } from '../services/api';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, switchMap, startWith } from 'rxjs/operators';
import { Preferences } from '@capacitor/preferences';
import { ToastController, AlertController } from '@ionic/angular';

//локалізація 
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-tab5',
  templateUrl: 'tab5.page.html',
  styleUrls: ['tab5.page.scss'],
  imports: [TranslateModule, CommonModule, IonLabel, IonList, IonItem, IonPopover,IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton, IonButton, IonIcon, ExploreContainerComponent]
})
export class Tab5Page {
  //for header 
    selectedLanguage = 'UA';
    selectedCountry = 'Ukraine';
    isLanguageOpen = false;
    isCountryOpen = false;
    hideHeader = false;
    isScrolled = false;
    lastScrollTop = 0;
    categories$: Observable<any[]> | undefined;
    countries$: any | [];
    languages$: any | [];
  //end for header
  ref_description_link: any | '';
  is_auth_user: any | false;
  is_active_user: any | false;
  transactions: any | [];
  plan_currency:any | '$';
  fullname:any | 'Користувач :)';
  my_balance:any | 0;
  earning_amount:any | 0;
  payout_amount:any | 0;

  constructor(
    private api: ApiService,
    private menu: MenuController,
    private router: Router,
    private auth: AuthService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private translate: TranslateService
  ) {
    addIcons({ language, logInOutline, chevronForwardOutline, languageOutline, mapOutline, menuOutline,notificationsOutline, addOutline, removeOutline});
     //translate.setDefaultLang('ua');
     translate.use('ua');
     this.fullname = this.translate.instant('TEXT_USER');
  }

  async ngOnInit(){
    const { value: token } = await Preferences.get({ key: 'auth_token' });
    if (token) {
      this.is_auth_user = true;
    }

    //for header
    this.api.getAvailableLanguages().subscribe({
      next: (res:any) => {
        if(typeof res.languages != 'undefined'){
          this.languages$ = res.languages;
          this.languages$?.forEach((element:any) => {
            if(typeof element.active != 'undefined' && element.active){
              this.selectedLanguage = element.context_key.toUpperCase();
            }
          });
        }
      },
      error: (err) => {
        console.error('Помилка HTTP:', err);
      },
    });
    this.auth.getLanguage().then(lang_code => {
      if (lang_code !== null) {
        this.selectedLanguage = lang_code.toUpperCase();
        // локалізація
        this.translate.use(lang_code);
      }
    });

    this.api.getAvailableCountry().subscribe({
      next: (res:any) => {
        if(typeof res.countries != 'undefined'){
          this.countries$ = res.countries;
          this.countries$?.forEach((element:any) => {
            if(typeof element.selected != 'undefined' && element.selected){
              this.selectedCountry = element.name;
            }
          });
        }
      },
      error: (err) => {
        console.error('Помилка HTTP:', err);
      },
    });

    this.auth.getCountry().then(country_id => {
      if (country_id !== null) {
        this.countries$?.forEach((element:any) => {
            if(element.country_id == country_id){
              this.selectedCountry = element.name;
            }
        });
      }
    });
    //end header

    this.api.getMyEarnings().subscribe({
      next: (res:any) => {
        this.ref_description_link = res.ref_description_link;
        this.is_auth_user = Boolean(res.is_auth);
        this.is_active_user = Boolean(res.is_active_user);
        this.plan_currency = res.plan_currency;
        this.fullname = res.fullname;
        if(res.transactions){
          this.transactions = res.transactions;
        }
        this.my_balance = res.my_balance;
        this.payout_amount = res.payout_amount;
        this.earning_amount = res.earning_amount;
      }
    });

  }

  //for header 
  openMenu() {
    this.menu.open('main-menu'); // 'main-menu' is the ID of the ion-menu
  }

  onScroll(event: any) {
    const scrollTop = event.detail.scrollTop;
    if (scrollTop > this.lastScrollTop && scrollTop > 10) {
      this.hideHeader = true;
    } else {
      this.hideHeader = false;
    }
    this.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    this.isScrolled = scrollTop > 0;
  }
  selectLanguage(language: any) {
    this.auth.saveLanguage(language.context_key);
    this.selectedLanguage = language.context_key.toUpperCase();
    // локалізація
    this.translate.use(language.context_key);
  }
  
  selectCountry(country: any) {
    this.auth.saveCountry(country.country_id);
    this.selectedCountry = country.name;
  }
  //end for header


openRefDescription(){
  if(this.ref_description_link){
    window.open(this.ref_description_link, '_system');
  }else{
    this.showToast(this.translate.instant('TEXT_ERROR_LINK'));
  }
}

openAuth(){
  this.router.navigate(['/auth'], { replaceUrl: true });
}

async showToast(text:any, color:any='light', duration:any=2000) {
  const toast = await this.toastCtrl.create({
    message: text,
    duration: duration,
    position: 'bottom',
    color: color
  });
  await toast.present();
}

}
