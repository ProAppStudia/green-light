import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonPopover, IonList, IonItem, MenuController } from '@ionic/angular/standalone'; // Removed IonMenuButton
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { notificationsOutline, languageOutline, globeOutline, menuOutline, searchOutline, mapOutline, cart } from 'ionicons/icons';
import { globeOutline as globeOutlineIcon } from 'ionicons/icons'; // Alias for globeOutline if needed elsewhere
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest, forkJoin, of, Subject } from 'rxjs';
import { map, switchMap, startWith, tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CategoriesGridComponent } from '../components/categories-grid/categories-grid.component'; // Import the new component

/*import { ApiService } from '../services/api.service'; // old one*/
import { Router } from '@angular/router';

import { ApiService } from '../services/api';
import { AuthService } from 'src/app/services/auth.service';

// Import Swiper modules
import { register } from 'swiper/element/bundle';
// Register Swiper custom elements
register();

interface Discount {
  id: number;
  name: string;
  category: string;
  percent: string;
  description: string;
  image: string;
  category_id: number;
  discount_id:number;
}

interface Category {
  category_id: number; // Changed from 'id' to 'category_id' to match API response
  name: string;
  icon: string;
}

interface CategorizedDiscounts {
  category: Category;
  discounts: Discount[];
}

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonPopover, IonList, IonItem, FormsModule, CommonModule, CategoriesGridComponent], // Removed IonMenuButton
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class Tab1Page implements OnInit {
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
  homeData$: Observable<any> | undefined;
  categorizedDiscounts$: Observable<CategorizedDiscounts[]> | undefined;

  //for search 
  search_keyword = '';
  search_results: any[] = [];
  private searchSubject = new Subject<string>();
  search_loading = false;
  search_showResults = false;

  constructor(
    private apiService: ApiService, 
    private menu: MenuController, 
    private cdr: ChangeDetectorRef,
    private router: Router,
    private auth: AuthService
  ) {
    addIcons({notificationsOutline,languageOutline,mapOutline,menuOutline,searchOutline,cart,globeOutline:globeOutlineIcon});
  }

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

  ngOnInit() {
    this.homeData$ = this.apiService.getHomeData().pipe(
      map(response => {
        console.log('Home Data (parsed):', JSON.stringify(response, null, 2));
        return response;
      })
    );

    this.categories$ = this.apiService.getCategories().pipe(
      map(response => {
        return response.categories;
      })
    );

    //new lines
    this.apiService.getAvailableCountry().subscribe({
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
    this.apiService.getAvailableLanguages().subscribe({
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
    //new lines

    this.categorizedDiscounts$ = this.categories$.pipe(
      switchMap(categories => {
        if (!categories || categories.length === 0) {
          return of([]);
        }
        const categoryDiscountObservables = categories.map((category: Category) =>
          this.apiService.getCategoryDiscounts(category.category_id).pipe( // Use category.category_id
            map(response => ({
              category: category,
              discounts: response.discounts || []
            }))
          )
        );
        return forkJoin(categoryDiscountObservables);
      })
    );

    //for search 
    this.searchSubject.pipe(
      debounceTime(600),           // затримка, щоб не спамити сервер
      distinctUntilChanged(),      // лише якщо змінився текст
      switchMap((term: string) => {
        if (!term.trim() || term.trim().length <= 3) {
          this.search_results = [];
          return [];
        }else{
          this.search_loading = true;
          return this.apiService.getItemsByKeyword(term);
        }
      })
    ).subscribe({
      next: (res: any) => {
        this.search_results = res.results || [];
        this.search_loading = false;
        this.search_showResults = true;
      },
      error: err => {
        console.error('Помилка пошуку:', err);
        this.search_loading = false;
      }
    });
  }

  selectLanguage(language: any) {
    this.auth.saveLanguage(language.context_key);
    this.selectedLanguage = language.context_key.toUpperCase();
    this.ngOnInit(); // reload all data
  }

  selectCountry(country: any) {
    this.auth.saveCountry(country.country_id);
    this.selectedCountry = country.name;
    this.ngOnInit(); // reload all data
  }

  openDiscount(discount_id: number){
    this.router.navigate(['/discount', discount_id]);
  }
  openShop(shop_id: number){
    this.router.navigate(['/tabs/shop', shop_id]);
  }

  // for search 
  onSearchChange(event: any) {
    const value = event.target.value.trim();
    this.search_keyword = value;
    this.searchSubject.next(value);
  }

  openResult(id: any, type:any='discount') {
    this.search_showResults = false;
    this.search_keyword = '';
    if(type == 'discount'){
      this.openDiscount(id);
    }else{ 
      this.openShop(id);
    }
  }

  closeResults() {
    setTimeout(() => this.search_showResults = false, 150); // щоб не зникло при кліку
  }

}
