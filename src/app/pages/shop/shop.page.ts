import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonBadge, IonListHeader, IonChip, IonLabel, IonThumbnail, ToastController, IonFab, IonFabButton, IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonBackButton, IonCard,IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonPopover, IonList, IonItem, IonIcon, IonSpinner } from '@ionic/angular/standalone';

import { Location } from '@angular/common';
import { addIcons } from 'ionicons';
import { add, bagCheckOutline, callOutline, arrowBackOutline, chevronBackOutline } from 'ionicons/icons';
import { IonicModule, LoadingController } from '@ionic/angular';
import { ApiService } from '../../services/api';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { Router } from '@angular/router';

//локалізація 
import { TranslateModule, TranslateService } from '@ngx-translate/core';

// Import Swiper modules
import { register } from 'swiper/element/bundle';
// Register Swiper custom elements
register();

@Component({
  selector: 'app-shop',
  templateUrl: './shop.page.html',
  styleUrls: ['./shop.page.scss'],
  standalone: true,
  imports: [TranslateModule, IonListHeader, IonBadge, IonChip, IonLabel, IonThumbnail, IonFab, IonFabButton, IonCard, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonBackButton, IonButtons, IonButton, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonPopover, IonList, IonItem, IonIcon,IonSpinner],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ShopPage implements OnInit {

  shop_name:any;
  shop_logo:string='';
  shop_description:string='';
  shop_addresses:any=[];
  shop_phones:any=[];
  shop_socials:any=[];
  shop_id!:string;
  shop:any;
  discounts:any;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private loadingCtrl: LoadingController,
    private toastController: ToastController,
    private router: Router,
    private location: Location,
    private translate: TranslateService,
    private auth: AuthService
  ) { 
    addIcons({arrowBackOutline,  add, bagCheckOutline, callOutline, chevronBackOutline});
  }

  ngOnInit() {

    this.shop_id = this.route.snapshot.paramMap.get('id') || '';
    if(this.shop_id){

      this.api.getShopById(this.shop_id).subscribe({
        next: async (res:any) => {
          
          if(typeof res.error != 'undefined'){
            this.presentToast(res.error, 'danger');
            this.router.navigate(['/tabs/tab1']);
          }else{
            this.shop = res. shop|| '';
            this.shop_name = res.shop.shop_name;
            this.shop_logo = res.shop.shop_logo;
            this.shop_addresses = res.shop.shop_addresses;
            this.shop_phones = res.shop.shop_phones;
            this.shop_socials = res.shop.shop_socials;
            this.shop_description = res.shop.shop_description;
            this.discounts = res.discounts;

          }
          this.loading = false;
          
        },
        error: async (err) => {
          console.error('Помилка завантаження товару:', err);
          this.presentToast(this.translate.instant('TEXT_ERROR_LOAD_DISCOUNT'), 'danger');
          this.loading = false;
        }
      });

      this.loading = false;
    }else{
      this.loading = false;
    }

  this.auth.getLanguage().then(lang_code => {
      if (lang_code !== null) {
        this.translate.use(lang_code);
      }else{
        this.translate.use('ua');
      }
    });

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


  openDiscount(discount_id: number){
    this.router.navigate(['/discount', discount_id]);
  }

  goBack() {
    this.location.back();
  }

}
