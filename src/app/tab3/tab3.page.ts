import { Component, OnInit } from '@angular/core';
import { IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton, IonButton, IonIcon, IonItem, IonSpinner, MenuController } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { language, cart, chevronDown, flag, notificationsOutline, mapOutline, menuOutline, searchOutline, globeOutline, languageOutline, listOutline, gridOutline, pencilOutline, barChartOutline, cartOutline, logOutOutline, trashOutline, flashOffOutline, flashOutline, copyOutline, peopleOutline, cashOutline, arrowBackOutline, starOutline, closeOutline, thumbsUpOutline, chevronForwardOutline } from 'ionicons/icons';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, switchMap, startWith } from 'rxjs/operators';
import { Preferences } from '@capacitor/preferences';
import { FormsModule } from '@angular/forms';
import { ToastController, IonicModule, AlertController, ModalController } from '@ionic/angular';
import { ApiService } from '../services/api';
import { InfoModalComponent } from 'src/app/components/info-modal/info-modal.component';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

import { registerPlugin } from '@capacitor/core';
interface MyBarcodeScanner {
  checkPermissions(): Promise<{ camera: 'granted' | 'denied' | 'prompt' }>;
  requestPermissions(): Promise<{ camera: 'granted' | 'denied' | 'prompt' }>;
  startScan(): Promise<{ hasContent: boolean; content?: string }>;
  hideBackground(): Promise<void>;
  showBackground(): Promise<void>;
  stopScan(): Promise<void>;
}
const BarcodeScanner = registerPlugin('BarcodeScanner') as MyBarcodeScanner;


@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [
    IonMenuButton,
    IonMenu,
    CommonModule,
    IonSpinner,
    FormsModule,
    IonicModule,                 // для усіх Ionic компонентів
    ExploreContainerComponent    // якщо це standalone компонент
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})



export class Tab3Page {
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

  manualCode = '';
  isScanning = false;

  constructor(
    private api: ApiService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private menu: MenuController,
    private router: Router,
    private auth: AuthService,
    private toastCtrl: ToastController,
  ) {

    addIcons({language, languageOutline, cart, chevronDown, flag, notificationsOutline, mapOutline, menuOutline});
  }

  ngOnInit(){
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
    //end for header

  }

  async startScan() {
    try {
      const permission = await BarcodeScanner.checkPermissions();
      if (permission.camera !== 'granted') {
        await BarcodeScanner.requestPermissions();
      }

      this.isScanning = true;
      document.body.classList.add('scanner-active');
      await BarcodeScanner.hideBackground();

      const result = await BarcodeScanner.startScan();
      this.isScanning = false;
      await BarcodeScanner.showBackground();

      if (result?.hasContent && result.content) {
        this.checkQrOnServer(result.content);
      } else {
        this.showAlert('QR-код не знайдено');
      }
    } catch (err) {
      console.error(err);
      this.isScanning = false;
      await BarcodeScanner.showBackground();
      this.showAlert('Помилка при скануванні');
    }
  }

  async checkQrOnServer(code: string) {
  try {
    this.api.validateCode(code).subscribe({
      next: (res) => {
        if (res.success) {
          this.openModal(res.success);
        } else if(res.error) {
          this.showAlert(res.error || 'Код не знайдено');
        }
      },
      error: (err) => {
        console.error('❌ Помилка HTTP:', err);
        this.showAlert('Помилка з’єднання з сервером');
      },
    });
  } catch (e) {
    this.showAlert('Неочікувана помилка');
  }
  
}


  async openModal(data: any) {
    
    const modal = await this.modalCtrl.create({
      component: InfoModalComponent,
      componentProps: { data },
    });
    await modal.present();
    console.log('Modal is present, data:');
    console.log(data);
  }

  async showAlert(message: string) {
    const alert = await this.alertCtrl.create({
      header: 'Увага',
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  submitManualCode() {
    const trimmed = this.manualCode.trim();
    if (trimmed.length > 0) {
      this.checkQrOnServer(trimmed);
    } else {
      this.showAlert('Введіть код для перевірки');
    }
  }

  //for header 
  openMenu() {
    this.menu.open('main-menu');
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
  

}
