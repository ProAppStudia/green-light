import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonFab, IonFabButton, IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonCard,IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonPopover, IonList, IonItem, IonIcon, IonSpinner } from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';
import { IonicModule, LoadingController } from '@ionic/angular';
import { ApiService } from '../../services/api';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-discount',
  templateUrl: './discount.page.html',
  styleUrls: ['./discount.page.scss'],
  standalone: true,
  imports: [IonFab, IonFabButton, IonCard, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonBackButton, IonButtons, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonPopover, IonList, IonItem, IonIcon,IonSpinner]
})
export class DiscountPage implements OnInit {

  discount_id!: string;
  discount: any = null;
  discount_name: any;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private loadingCtrl: LoadingController
  ) { 
    addIcons({ add });
  }

  async ngOnInit() {
    this.discount_id = this.route.snapshot.paramMap.get('id') || '';
    if (this.discount_id) {
      const loader = await this.loadingCtrl.create({ message: 'Завантаження товару...' });
      await loader.present();

      this.api.getDiscountById(this.discount_id).subscribe({
        next: async (res:any) => {
          console.log('Товар:', res);
          this.discount = res.discount || '';
          this.discount_name = res.discount.name;
          this.loading = false;
          await loader.dismiss();
        },
        error: async (err) => {
          console.error('Помилка завантаження товару:', err);
          await loader.dismiss();
          this.loading = false;
        }
      });
    }
  }

}
