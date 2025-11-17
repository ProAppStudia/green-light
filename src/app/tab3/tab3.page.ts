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
import { ToastController, IonicModule, ModalController } from '@ionic/angular';
import { ApiService } from '../services/api';
import { InfoModalComponent } from 'src/app/components/info-modal/info-modal.component';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
//локалізація 
import { TranslateModule, TranslateService } from '@ngx-translate/core';
// новий сканер 
import { BarcodeScanner, BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';



@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [
    TranslateModule,
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
    private menu: MenuController,
    private router: Router,
    private auth: AuthService,
    private toastCtrl: ToastController,
    private translate: TranslateService
  ) {
    addIcons({language, languageOutline, cart, chevronDown, flag, notificationsOutline, mapOutline, menuOutline});
    translate.use('ua');
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
    //end for header

  }

  async startScan() {
  try {
    // 1. Перевіряємо дозволи
    const perm = await BarcodeScanner.checkPermissions();
    if (perm.camera !== 'granted') {
      const req = await BarcodeScanner.requestPermissions();
      if (req.camera !== 'granted') {
        this.presentToast(this.translate.instant('TEXT_CAMERA_PERMISSION_DENIED'), 'danger');
        return;
      }
    }

    this.isScanning = true;

    // 2. Запускаємо сканування
    const result = await BarcodeScanner.scan();

    this.isScanning = false;

    if (result?.barcodes?.length) {
      const code = result.barcodes[0].rawValue;
      if (code) {
        this.checkQrOnServer(code);
        return;
      }
    }

    this.presentToast(this.translate.instant('TEXT_QR_NOT_FOUND'), 'danger');
    
  } catch (err) {
    console.error('MLKit scan error:', err);
    this.isScanning = false;
    this.presentToast(this.translate.instant('TEXT_QR_ERROR_OCCURED'), 'danger');
  }
}


  async checkQrOnServer(code: string) {
  try {
    this.api.validateCode(code).subscribe({
      next: (res) => {
        if (res.success) {
          this.openModal(res.success);
        } else if(res.error) {
          this.presentToast(res.error || this.translate.instant('TEXT_QR_CODE_NOT_FOUND'), 'danger');
        }
      },
      error: (err) => {
        console.error(' Помилка HTTP:', err);
        this.presentToast(this.translate.instant('TEXT_QR_CODE_ERROR_CONNECT'), 'danger');
      },
    });
  } catch (e) {
    this.presentToast(this.translate.instant('ERROR_OCCURED'), 'danger');
  }
  
}


  async openModal(data: any) {
    
    const modal = await this.modalCtrl.create({
      component: InfoModalComponent,
      componentProps: { data },
    });
    await modal.present();
  }

  async presentToast(message:string, color:string, delay: any = 3000) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: delay,
      position: 'bottom',
      swipeGesture: 'vertical',
      color: color
    });

    await toast.present();
  }


  submitManualCode() {
    const trimmed = this.manualCode.trim();
    if (trimmed.length > 0) {
      this.checkQrOnServer(trimmed);
    } else {
      this.presentToast(this.translate.instant('TEXT_QR_ENTER_CODE'), 'danger');
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
    // локалізація
    this.translate.use(language.context_key);
  }
  
  selectCountry(country: any) {
    this.auth.saveCountry(country.country_id);
    this.selectedCountry = country.name;
  }
  //end for header
  

}
