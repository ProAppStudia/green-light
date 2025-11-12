import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { Component, OnInit } from '@angular/core';
import { IonLoading, IonHeader,IonFooter, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton, IonButton, IonIcon, IonSegment, IonSegmentButton, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonPopover, IonList, IonItem, MenuController, IonInput, IonText, IonInputPasswordToggle } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { language, cart, chevronDown, flag, notificationsOutline, mapOutline, menuOutline, searchOutline, globeOutline, languageOutline, listOutline, gridOutline, pencilOutline, barChartOutline, cartOutline, logOutOutline, trashOutline, flashOffOutline, flashOutline, copyOutline, peopleOutline, cashOutline, arrowBackOutline, starOutline, closeOutline } from 'ionicons/icons';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ApiService } from '../services/api';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, switchMap, startWith } from 'rxjs/operators';
import { Preferences } from '@capacitor/preferences';
import { ToastController, AlertController } from '@ionic/angular';


import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss'],
  imports: [IonLoading, IonInputPasswordToggle, IonInput, IonText, IonFooter, IonHeader, IonToolbar, IonTitle, IonContent, IonMenuButton, IonButton, IonSegment, IonSegmentButton, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonPopover, IonList, IonItem, FormsModule, CommonModule, IonButtons, IonMenuButton, IonButton, IonIcon, ExploreContainerComponent],
})
export class Tab4Page {
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
  fullname: any | '';
  email: any | '';
  currentView: 'main' | 'edit' | 'balance' | 'purchases' | 'payout' = 'main';
  formData = {
    fullname: '',
    username: '',
    password: '',
    confirm_password: ''
  };
  showLoading: boolean = false;
  purchases: any | [];
  popupClass: any | '';
  popupImg: any | '';
  popupCode: any | '';

  wallet_address: any | '';
  wallet_amount: any | 0;
  plan_amount: any | '';
  plan_currency: any | '';
  plan_currency_type: any | '';
  max_payout_amount: any | '';
  count_referals: any | 0;
  ref_code: any | '';
  ref_link: any | '';
  is_active_user:any | false;


  constructor(
    private api: ApiService,
    private menu: MenuController,
    private router: Router,
    private auth: AuthService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    addIcons({ language, cart, chevronDown, flag, notificationsOutline, mapOutline, menuOutline, 
      searchOutline, globeOutline, languageOutline, pencilOutline, barChartOutline, listOutline, 
      cartOutline, logOutOutline, trashOutline, flashOutline, copyOutline, peopleOutline, 
      cashOutline, arrowBackOutline, starOutline, closeOutline});
  }

  async ngOnInit() {
    const { value: token } = await Preferences.get({ key: 'auth_token' });
    
    if (!token) {
      this.router.navigate(['/auth'], { replaceUrl: true });
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
        console.error('❌ Помилка HTTP:', err);
      },
    });
    // FOR header підставити активну мову
    // ПОтрібно використати .then, бо це promise а не переміна, тож потрібно дочекатись відповіді
    this.auth.getLanguage().then(lang_code => {
      if (lang_code !== null) {
        this.selectedLanguage = lang_code.toUpperCase();
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
        console.error('❌ Помилка HTTP:', err);
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

    this.api.getMyName().subscribe({
      next: (res:any) => {
        if(typeof res.success != 'undefined'){
          this.fullname = res.fullname;
          this.email = res.email;
          this.max_payout_amount = res.max_payout_amount;
          this.plan_currency = res.plan_currency;
          this.plan_amount = res.plan_price;
          this.plan_currency_type = res.plan_currency_type;
          this.count_referals = res.count_referals;
          this.ref_code = res.ref_code;
          this.ref_link = res.ref_link;
          this.formData.fullname = this.fullname;
          this.formData.username = this.email;
          this.is_active_user = res.is_active_user;
        }
      },
      error: (err) => {
        console.error(err);
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
  }
  
  selectCountry(country: any) {
    this.auth.saveCountry(country.country_id);
    this.selectedCountry = country.name;
  }
  //end for header

  copy(text:any){
    navigator.clipboard.writeText(text)
    .then(() => {
      this.showToast('Скопійовано!');
    })
    .catch(err => {
      this.showToast('Виникла помилка...')
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

switchView(view: 'main' | 'edit' | 'balance' | 'purchases' | 'payout') {
  this.currentView = view;
}
updateProfile(){
  //
  let error = '';

  if(!error){
    this.api.updateProfile(this.formData).subscribe({
      next: (res:any) => {
        if(typeof res.success != 'undefined' && res.success){
          this.showToast('Успіх!', 'success');
          this.currentView = 'main';
          this.ngOnInit();
        }else if(typeof res.error != 'undefined' && res.error){
          this.showToast(res.error, 'danger');
        }
      },
      error: (err) => {
        console.error('http error '+ err);
      }
    });
  }

  this.showToast('Успіх!', 'success');
  this.currentView = 'main';
}

buyPlane(){
  this.api.createPaymentLink().subscribe({
    next: (res:any) => {
      if(typeof res.success != 'undefined' && res.checkout_url){
        this.showToast(res.success, 'success');
        window.open(res.checkout_url, '_system');
      }else if(typeof res.error != 'undefined'){
        this.showToast(res.error, 'danger');
      }
    },
    error: (err) => {
      console.error('error: '+err);
    }
  });
}

getMyPurchases(){
  this.purchases = [];
  this.showLoading = true;
  this.currentView = 'purchases';  
  this.api.getMyPurchases().subscribe({
    next: (res:any) => {
      if(typeof res.purchases != 'undefined'){
        this.purchases = res.purchases;
      }
      this.showLoading = false;
    },
    error: (err) => {
      console.error(err);
      this.showLoading = false;
    }
  });
}

deletePurchase(id:any){
  this.api.deleteMyPurchase(id).subscribe({
    next : (res:any) => {
      if(typeof res.success != 'undefined'){
        this.getMyPurchases();
        this.showToast('Успіх!', 'success');
      }else if(typeof res.error != 'undefined'){
        this.showToast(res.error, 'danger');
      }
    }, 
    error: (err) => {
      console.log(err);
    }
  });
}
openDiscount(discount_id: number){
    this.router.navigate(['/discount', discount_id]);
}
hidePopUp(){
  this.popupClass = '';
}
showPopup(img:any, code:any){
  this.popupImg = img;
  this.popupCode = code;
  this.popupClass = 'show';
}

createPayout(){
  if(String(this.wallet_address).length < 5){
    this.showToast('Введіть адресу гаманця', 'danger');
  }else if(Number(this.wallet_amount) > Number(this.max_payout_amount)){
    this.showToast('Сума перевищує доступну', 'danger');
  }else{
    this.api.createPayout({address: this.wallet_address, amount: this.wallet_amount}).subscribe({
      next: (res:any) => {
        if(typeof res.success != 'undefined'){
          this.showToast(res.success, 'success', 8000);
          this.currentView = 'main';
        }else if(typeof res.error != 'undefined'){
          this.showToast(res.error, 'danger');
        }
      }
    });
  }
}

logout(){
  this.auth.logout();
  this.router.navigate(['/tabs/tab1']);
}

async deleteAccount(){
   const alert = await this.alertCtrl.create({
    header: 'Підтвердіть видалення',
    message: 'Ви не зможете відновити акаунт та всю пов\'язану із ним інформацію.',
    buttons: [
      {
        text: 'Скасувати',
        role: 'cancel',
        cssClass: 'secondary',
        handler: () => {

        } 
      },
      {
        text: 'Підтвердити',
        cssClass: ['danger', 'red'],
        handler: () => {
          this.api.deleteAccount().subscribe({
            next: (res:any) => {
              if(typeof res.success != 'undefined'){
                this.showToast(res.success, 'success', 5500);
                this.logout();
              }else if(typeof res.error != 'undefined'){
                this.showToast(res.error, 'success');
              }
            }
          });
        }
      }
    ]
  });

  await alert.present();
}



}
