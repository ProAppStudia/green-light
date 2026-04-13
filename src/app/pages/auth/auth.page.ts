import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonInput,
  IonButton, IonItem, IonLabel, IonText, IonIcon, IonCard,
  IonButtons, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logInOutline, personAddOutline, arrowForwardOutline, closeOutline } from 'ionicons/icons';
import { ApiService } from 'src/app/services/api';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { NavController } from '@ionic/angular';
import { Browser } from '@capacitor/browser';
//локалізація 
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-auth',
  standalone: true,
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  imports: [
    TranslateModule, CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonInput, IonButton, IonItem, IonLabel, IonText, IonIcon, IonCard
  ],
})
export class AuthPage {
  isLoginMode = true;

  loginData = { username: '', password: '' };
  registerData = { fullname: '', email: '', password: '', referral_code: '', password_confirm: '' };

  loading = false;
  errorMessage = '';

  constructor(
    private api: ApiService, 
    private router: Router,
    private navCtrl: NavController,
    private auth:AuthService,
    private toastController: ToastController,
    private translate: TranslateService
  ) {
    addIcons({ logInOutline, personAddOutline, arrowForwardOutline, closeOutline });
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = '';
  }

  //Для тесту, видалити токен
  ngOnInit() {
    //this.auth.logout();
    
    this.auth.getLanguage().then(lang_code => {
      if (lang_code !== null) {
        this.translate.use(lang_code);
      }else{
        this.translate.use('ua');
      }
    });

  }

  async onSubmit() {
    this.errorMessage = '';
    this.loading = true;

    if (this.isLoginMode) {
      if(this.loginData.password == '' || this.loginData.username == ''){
        this.presentToast(this.translate.instant('TEXT_CHECK_LOGIN_DATA'), 'danger');
        this.loading = false;
      }else{
        this.auth.login(this.loginData.username, this.loginData.password).subscribe({
          next: async (res:any) => {
            await this.handleLoginResponse(res);
            this.loading = false;
          },
          error: async (err) => {
            this.presentToast(this.translate.instant('TEXT_QR_CODE_ERROR_CONNECT'), 'danger');
            this.loading = false;
          }
        });
      }
      
    } else {
      if (this.registerData.password !== this.registerData.password_confirm) {
        this.loading = false;
        this.errorMessage = this.translate.instant('TEXT_PASS_NO_MATCH');
        return;
      }

      this.auth.register(this.registerData).subscribe({
          next: async (res:any) => {
            if(typeof res.error != 'undefined' && res.error){
              this.presentToast(res['error'], 'danger');
            }else if(res.success){
              if (!res.token) {
                await this.presentToast('Акаунт створено. Виконуємо автоматичний вхід...', 'success', 1800);
                this.auth.login(this.registerData.email, this.registerData.password).subscribe({
                  next: async (loginRes:any) => {
                    await this.handleLoginResponse(loginRes, 'Акаунт успішно створено');
                    this.loading = false;
                  },
                  error: async () => {
                    this.presentToast('Акаунт створено, увійдіть у кабінет вручну', 'warning', 4000);
                    this.isLoginMode = true;
                    this.loginData.username = this.registerData.email;
                    this.loginData.password = '';
                    this.loading = false;
                  }
                });
                return;
              } else {
                await this.finalizeAuth(res.token, 'Акаунт успішно створено');
              }
            }
            this.loading = false;
          },
          error: async (err) => {
            this.presentToast(this.translate.instant('TEXT_QR_CODE_ERROR_CONNECT'), 'danger');
            this.loading = false;
          }
      });
    }
  }

  private async handleLoginResponse(res: any, successMessage = 'Вхід виконано успішно') {
    if(typeof res?.error != 'undefined' && res.error){
      await this.presentToast(res.error, 'danger');
      return;
    }

    if(res?.success){
      if (!res.token) {
        await this.presentToast('Токен авторизації не отримано', 'danger');
        return;
      }

      await this.finalizeAuth(res.token, successMessage);
    }
  }

  private async finalizeAuth(token: string, successMessage: string) {
    await this.presentToast(successMessage, 'success', 1500);
    await this.auth.saveToken(token);
    await this.navCtrl.navigateRoot('/tabs/tab1', { animated: false });
  }

  openForgotPassword() {
    void Browser.open({ url: 'https://firstgreenlight.com/forgot-password/' });
  }
  goHome(){
    this.navCtrl.navigateBack('/tabs/tab4', { animated: false });
  }

  

  async presentToast(message:string, color:string, delay: any = 3000) {
    const toast = await this.toastController.create({
      message: message,
      duration: delay,
      position: 'bottom',
      swipeGesture: 'vertical',
      color: color
    });

    await toast.present();
  }

}
