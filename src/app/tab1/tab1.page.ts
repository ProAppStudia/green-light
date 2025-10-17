import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton, IonButton, IonIcon, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonPopover, IonList, IonItem, MenuController } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { notificationsOutline, languageOutline, globeOutline, menuOutline, searchOutline, mapOutline, cart } from 'ionicons/icons';
import { globeOutline as globeOutlineIcon } from 'ionicons/icons'; // Alias for globeOutline if needed elsewhere
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest, forkJoin, of } from 'rxjs';
import { map, switchMap, startWith, tap } from 'rxjs/operators';

import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';

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
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton, IonButton, IonIcon, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonPopover, IonList, IonItem, FormsModule, CommonModule],
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
  countries$: Observable<any[]> | undefined;
  languages$: Observable<any[]> | undefined;
  homeData$: Observable<any> | undefined;
  categorizedDiscounts$: Observable<CategorizedDiscounts[]> | undefined;

  constructor(
    private apiService: ApiService, 
    private menu: MenuController, 
    private cdr: ChangeDetectorRef,
    private router: Router
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
      tap(response => console.log('API: getCategories raw response for tab1:', response)), // Add tap to log raw response
      map(response => {
        console.log('Categories (parsed):', JSON.stringify(response, null, 2));
        return response.categories;
      })
    );

    this.countries$ = this.apiService.getCountries().pipe(
      map(response => {
        console.log('Countries (parsed):', JSON.stringify(response, null, 2));
        const countries = response.countries;
        const selectedCountry = countries.find((country: any) => country.selected);
        if (selectedCountry) {
          this.selectedCountry = selectedCountry.name;
        }
        return countries;
      })
    );

    this.languages$ = this.apiService.getLanguages().pipe(
      map(response => {
        console.log('Languages (parsed):', JSON.stringify(response, null, 2));
        const languages = response.languages;
        const activeLanguage = languages.find((lang: any) => lang.active);
        if (activeLanguage) {
          this.selectedLanguage = activeLanguage.context_key.toUpperCase();
        }
        return languages;
      })
    );

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
  }

  selectLanguage(language: any) {
    console.log('Attempting to set language:', language);
    this.selectedLanguage = language.context_key.toUpperCase();
    this.isLanguageOpen = false;
    this.cdr.detectChanges(); // Manually trigger change detection
    this.apiService.setLanguage(language.context_key).subscribe(response => {
      console.log('Language set API response:', response);
      this.categories$ = this.apiService.getCategories().pipe(map(res => res.categories));
      this.homeData$ = this.apiService.getHomeData();
      // Re-fetch categorized discounts after language change
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
    });
  }

  selectCountry(country: any) {
    console.log('Attempting to set country:', country);
    this.selectedCountry = country.name;
    this.isCountryOpen = false;
    this.cdr.detectChanges(); // Manually trigger change detection
    this.apiService.setCountry(country.country_id).subscribe(response => {
      console.log('Country set API response:', response);
      this.categories$ = this.apiService.getCategories().pipe(map(res => res.categories));
      this.homeData$ = this.apiService.getHomeData();
      // Re-fetch categorized discounts after country change
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
    });
  }

  openDiscount(discount_id: number){
    this.router.navigate(['/discount', discount_id]);
  }

}
