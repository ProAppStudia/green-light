import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonLabel, IonThumbnail, ToastController, IonFab, IonFabButton, IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonBackButton, IonCard,IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonPopover, IonList, IonItem, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { Location } from '@angular/common';
import { addIcons } from 'ionicons';
import { add, bagCheckOutline, callOutline, arrowBackOutline, chevronBackOutline, chevronForwardOutline, mapOutline, calendarOutline, linkOutline, pricetag, pricetagOutline } from 'ionicons/icons';
import { ApiService } from '../../services/api';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

import { Router } from '@angular/router';
//локалізація 
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { register } from 'swiper/element/bundle';
register();

@Component({
  selector: 'app-discount',
  templateUrl: './discount.page.html',
  styleUrls: ['./discount.page.scss'],
  standalone: true,
  imports: [TranslateModule, IonLabel, IonThumbnail, IonFab, IonFabButton, IonCard, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonBackButton, IonButtons, IonButton, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonPopover, IonList, IonItem, IonIcon,IonSpinner],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DiscountPage implements OnInit {

  discount_id!: string;
  discount: any = null;
  discount_name: any;
  loading = true;
  firstImageLoaded = false;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private toastController: ToastController,
    private router: Router,
    private location: Location,
    private translate: TranslateService,
    private auth: AuthService
  ) { 
    addIcons({ add, callOutline, bagCheckOutline, arrowBackOutline, chevronBackOutline, 
      chevronForwardOutline, mapOutline, calendarOutline, linkOutline, pricetagOutline});
  }

  ngOnInit() {
    this.auth.getLanguage().then(lang_code => {
      if (lang_code !== null) {
        this.translate.use(lang_code);
      }else{
        this.translate.use('ua');
      }
    });

    this.route.paramMap.pipe(
      switchMap((params) => {
        this.discount_id = params.get('id') || '';
        this.loading = true;
        this.discount = null;
        this.firstImageLoaded = false;
        return this.api.getDiscountById(this.discount_id);
      })
    ).subscribe({
      next: (res: any) => {
        this.discount = res?.discount || null;
        this.discount_name = res?.discount?.name || '';
        this.loading = false;
        if (!this.discount?.images?.length) {
          this.firstImageLoaded = true;
        }
      },
      error: (err) => {
        console.error('Помилка завантаження товару:', err);
        this.loading = false;
      }
    });
  }

  addDiscountToMyList(discount_id:any){
    console.log(discount_id);
    this.api.setDiscountToMyList(discount_id).subscribe({
        next: async (res:any) => {
          if(res['success']){
            this.presentToast(res['success'], 'success');
          }else if(res['error']){
            this.presentToast(res['error'], 'danger');
          }
        },
        error: async (err) => {
          console.error('Помилка завантаження товару:', err);
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

  openShop(shop_id: number){
    this.router.navigate(['/tabs/shop', shop_id]);
  }
  openCategory(category_id: number){
    this.router.navigate(['/tabs/category', category_id]);
  }

  goBack() {
    this.location.back();
  }

  onHeroImageLoad(index: number) {
    if (index === 0) {
      this.firstImageLoaded = true;
    }
  }

}
