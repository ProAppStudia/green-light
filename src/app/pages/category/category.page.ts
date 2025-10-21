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
  IonIcon,
  IonPopover,
  MenuController
} from '@ionic/angular/standalone';
import { ApiService } from 'src/app/services/api';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { gridOutline, listOutline, languageOutline, mapOutline, notificationsOutline, menuOutline } from 'ionicons/icons';
//for header
import { Observable, BehaviorSubject, combineLatest, forkJoin, of } from 'rxjs';
import { map, switchMap, startWith, tap } from 'rxjs/operators';
//end header

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
    IonIcon,
    IonPopover
  ],
})
export class CategoryPage implements OnInit {
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
    private router: Router,
    private menu: MenuController, 
  ) {
    addIcons({listOutline, gridOutline, languageOutline, mapOutline, notificationsOutline, menuOutline});
  }

  ngOnInit() {
    // Отримуємо параметри з URL
    this.route.paramMap.subscribe((params) => {
      this.categoryId = params.get('id');
      this.searchQuery = this.route.snapshot.queryParamMap.get('search');
      this.resetAndLoad();
    });

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
      console.log('Attempting to set language:', language);
      
    }
  
    selectCountry(country: any) {
      console.log('Attempting to set country:', country);
      
    }
  //end for header

}
