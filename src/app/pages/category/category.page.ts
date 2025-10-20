import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonSpinner,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonButtons,
  IonIcon
} from '@ionic/angular/standalone';
import { ApiService } from 'src/app/services/api';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { gridOutline, listOutline } from 'ionicons/icons';

@Component({
  selector: 'app-category',
  templateUrl: './category.page.html',
  styleUrls: ['./category.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonSpinner,
    FormsModule,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonButtons,
    IonIcon
  ],
})
export class CategoryPage implements OnInit {
  categoryId: string | any;
  searchQuery: string | null = null;
  viewMode: 'grid' | 'list' = 'list'; // за замовчуванням 1 у ряд

  products: any[] = [];
  page = 1;
  totalPages = 1;
  limit = 10;
  isLoading = false;
  categoryTitle = '';
  total_discounts = 0;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private router: Router
  ) {
    addIcons({listOutline, gridOutline});
  }

  ngOnInit() {
    // Отримуємо параметри з URL
    this.route.paramMap.subscribe((params) => {
      this.categoryId = params.get('id');
      this.searchQuery = this.route.snapshot.queryParamMap.get('search');
      this.resetAndLoad();
    });
  }

  resetAndLoad() {
    this.products = [];
    this.page = 1;
    this.totalPages = 1;
    this.loadProducts();
  }

  async loadProducts() {
    if (this.isLoading || (this.page > this.totalPages)) return;
    this.isLoading = true;

    if(this.categoryId){
      try {
        this.api.getItemsByCategoryId(this.categoryId, this.page, this.limit).subscribe({
          next: (res:any) => {
            console.log(res);
            if(res){
              this.products = [...this.products, ...res.discounts];
              this.categoryTitle = res.name || 'Результати';
              this.totalPages = res.total_pages || 1;
              this.total_discounts = res.discounts_count || 0;
            }
          },
          error: (err) => {
            console.error('❌ Помилка HTTP:', err);
          },
        });
      } catch (e) {
        console.error('Помилка завантаження:', e);
      }finally {
         this.isLoading = false;
      }
    }
  }

  toggleView(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }

  loadMore() {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadProducts();
    }
  }

  openDiscount(discount_id: number){
    this.router.navigate(['/discount', discount_id]);
  }

}
