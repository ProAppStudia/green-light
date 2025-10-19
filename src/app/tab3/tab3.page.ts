import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton, IonButton, IonIcon } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { addIcons } from 'ionicons';
import { language } from 'ionicons/icons';

import { FormsModule } from '@angular/forms';

import { IonicModule, AlertController, ModalController } from '@ionic/angular';
import { ApiService } from '../services/api';
/*
import { InfoModalComponent } from 'src/app/components/info-modal/info-modal.component';
*/

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
    FormsModule,
    IonicModule,                 // для усіх Ionic компонентів
    ExploreContainerComponent    // якщо це standalone компонент
  ],
})



export class Tab3Page {
  currentLanguage = 'EN';

  manualCode = '';
  isScanning = false;

  constructor(
    private api: ApiService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController
  ) {}

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
      /*
      const res = await this.api.post('/check-qr', { code });
      if (res.success) {
        this.openModal(res.data);
      } else {
        this.showAlert(res.message || 'Код не знайдено');
      }
      */
    } catch (e) {
      this.showAlert('Помилка з’єднання з сервером');
    }
  }

  async openModal(data: any) {
    /*
    const modal = await this.modalCtrl.create({
      component: InfoModalComponent,
      componentProps: { data },
    });
    await modal.present();
    */
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

  toggleLanguage() {
    this.currentLanguage = this.currentLanguage === 'EN' ? 'ES' : 'EN';
    console.log('Language changed to:', this.currentLanguage);
  }
}
