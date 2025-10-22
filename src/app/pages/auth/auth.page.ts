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

@Component({
  selector: 'app-auth',
  standalone: true,
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  imports: [
    CommonModule, FormsModule,
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
    private auth:AuthService,
    private toastController: ToastController,
  ) {
    addIcons({ logInOutline, personAddOutline, arrowForwardOutline, closeOutline });
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = '';
  }

  //Для тесту, видалити токен
  ngOnInit() {
    this.auth.logout();
    console.log('token removed');
  }

  async onSubmit() {
    this.errorMessage = '';
    this.loading = true;

    if (this.isLoginMode) {
      if(this.loginData.password == '' || this.loginData.username == ''){
        this.presentToast('Перевірте поле логін та пароль', 'danger');
        this.loading = false;
      }else{
        console.log('Login '+this.loginData.username);
        console.log('Pass '+this.loginData.password);
        this.auth.login(this.loginData.username, this.loginData.password).subscribe({
          next: async (res:any) => {
            if(typeof res.error != 'undefined' && res.error){
              this.presentToast(res['error'], 'danger');
            }else if(res.success){
              this.auth.saveToken(res.token);
              this.router.navigate(['/tabs/tab1']);
            }
            this.loading = false;
          },
          error: async (err) => {
            console.error('Помилка сервера:', err);
            this.presentToast('Помилка сервера...', 'danger');
            this.loading = false;
          }
        });
      }
      
    } else {
      if (this.registerData.password !== this.registerData.password_confirm) {
        this.loading = false;
        this.errorMessage = 'Passwords do not match';
        return;
      }

      this.auth.register(this.registerData).subscribe({
          next: async (res:any) => {
            if(typeof res.error != 'undefined' && res.error){
              this.presentToast(res['error'], 'danger');
            }else if(res.success){
              this.auth.saveToken(res.token);
              this.router.navigate(['/tabs/tab1']);
            }
            this.loading = false;
          },
          error: async (err) => {
            console.error('Помилка сервера:', err);
            this.presentToast('Помилка сервера...', 'danger');
            this.loading = false;
          }
      });
    }
  }

  openForgotPassword() {
    window.open('https://firstgreenlight.com/forgot-password/', '_blank');
  }
  goHome(){
    this.router.navigate(['/tabs/tab1']);
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
