import { Component } from '@angular/core';
import { IonHeader, IonContent, IonButton, IonIcon, MenuController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, arrowForwardOutline, chevronForwardOutline, closeOutline, copyOutline, diamondOutline, language, languageOutline, logInOutline, mapOutline, menuOutline, notificationsOutline, openOutline, peopleOutline, removeOutline, rocketOutline, settingsOutline, storefrontOutline, walletOutline } from 'ionicons/icons';
import { CommonModule } from '@angular/common';

import { ApiService } from '../services/api';
import { AuthService } from 'src/app/services/auth.service';
import { Observable } from 'rxjs';
import { Preferences } from '@capacitor/preferences';
import { ToastController, AlertController, NavController } from '@ionic/angular';
import { Browser } from '@capacitor/browser';

//локалізація 
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-tab5',
  templateUrl: 'tab5.page.html',
  styleUrls: ['tab5.page.scss'],
  imports: [TranslateModule, CommonModule, IonHeader, IonContent, IonButton, IonIcon]
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
  glc_balance = 0;
  balance_usdt = 0;
  wallet_address = '';
  wallet_chain = '';
  total_supply = '';
  balance_updated_at = '';
  glc_coin_symbol = 'GLC';
  glc_price_usdt = 0;
  glc_transactions:any | [];
  glc_token_mint_amount = 1000;
  crypto_description_link = '';

  constructor(
    private api: ApiService,
    private menu: MenuController,
    private navCtrl: NavController,
    private auth: AuthService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private translate: TranslateService
  ) {
    addIcons({ settingsOutline, copyOutline, closeOutline, chevronForwardOutline, walletOutline, openOutline, language, logInOutline, languageOutline, mapOutline, menuOutline, notificationsOutline, addOutline, removeOutline, diamondOutline, peopleOutline, arrowForwardOutline, storefrontOutline, rocketOutline });
     //translate.setDefaultLang('ua');
     translate.use('ua');
     this.fullname = this.translate.instant('TEXT_USER');
  }

  async ionViewWillEnter() {
    const { value: token } = await Preferences.get({ key: 'auth_token' });
    if (token) {
      this.is_auth_user = true;
    }
    //for replace data
    this.ngOnInit();
    this.getHeadHeight();
  }

  async ngOnInit(){
    const { value: token } = await Preferences.get({ key: 'auth_token' });
    if (token) {
      this.is_auth_user = true;
    }

    this.about_crypto_display = false;

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
        this.translate.use(lang_code);
      }else{
        this.translate.use('ua');
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
        if(res.balance_glc){
          this.glc_balance = res.balance_glc;
        }
        if(res.wallet_address){
          this.wallet_address = res.wallet_address;
        }
        if(res.balance_updated_at){
          this.balance_updated_at = res.balance_updated_at;
        }
        if(res.total_supply){
          this.total_supply = res.total_supply;
        }
        if(res.wallet_chain){
          this.wallet_chain = res.wallet_chain;
        }
        if(res.glc_coin_symbol){
          this.glc_coin_symbol = res.glc_coin_symbol;
        }
        if(res.balance_usdt){
          this.balance_usdt = res.balance_usdt;
        }
        if(res.glc_price_usdt){
          this.glc_price_usdt = res.glc_price_usdt;
        }
        if(res.glc_transactions){
          this.glc_transactions = res.glc_transactions;
        }
        if(res.glc_token_mint_amount){
          this.glc_token_mint_amount = res.glc_token_mint_amount;
        }
        this.crypto_description_link = res.crypto_description_link;
        this.my_balance = res.my_balance;
        this.payout_amount = res.payout_amount;
        this.earning_amount = res.earning_amount;
      }
    });

  }

  openCryptoDescription(){
    if(this.crypto_description_link){
      void Browser.open({ url: this.crypto_description_link });
    }else{
      this.showToast(this.translate.instant('TEXT_ERROR_LINK'));
    }
  }

  //for header 
  openMenu() {
    this.menu.open('main-menu'); // 'main-menu' is the ID of the ion-menu
  }



  about_crypto_display = false;
  setAboutStyle(style:true | false){
    if(style == true && this.about_crypto_display == true){
      style = false; // if customer clicked on button for close
    }
    this.about_crypto_display = style;
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
    void Browser.open({ url: this.ref_description_link });
  }else{
    this.showToast(this.translate.instant('TEXT_ERROR_LINK'));
  }
}

openAuth(){
  this.navCtrl.navigateForward('/auth', { animated: false });
}

copy(text:any){
    navigator.clipboard.writeText(text)
    .then(() => {
      this.showToast(this.translate.instant('COPIED'));
    })
    .catch(err => {
      this.showToast(this.translate.instant('ERROR_OCCURED'));
    });
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

head_height = 85;
getHeadHeight(){
  const headerElement = document.querySelector('ion-header');
  if (headerElement && Number(headerElement.offsetHeight) > 40) {
    this.head_height = Number(headerElement.offsetHeight) + 10;
  }
}


}
