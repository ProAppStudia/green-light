import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton, IonButton, IonIcon, IonSegment, IonSegmentButton, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonPopover, IonList, IonItem } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { language, cart, chevronDown, flag, notificationsOutline, mapOutline, menuOutline, searchOutline, globeOutline } from 'ionicons/icons';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, switchMap, startWith } from 'rxjs/operators';

// Import Swiper modules
import { register } from 'swiper/element/bundle';
// Register Swiper custom elements
register();

interface Shop {
  id: number;
  name: string;
  category: string;
  address: string;
  image: string;
}

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton, IonButton, IonIcon, IonSegment, IonSegmentButton, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonPopover, IonList, IonItem, FormsModule, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class Tab2Page implements OnInit {
  selectedLanguage = 'UA';
  selectedCountry = 'Ukraine';
  selectedCategory: string | null = 'all'; // Initialize with 'all'
  isLanguageOpen = false;
  isCountryOpen = false;

  categories$: Observable<any[]> | undefined;
  countries$: Observable<any[]> | undefined;
  languages$: Observable<any[]> | undefined;
  shops$: Observable<any[]> | undefined;
  filteredShops$: Observable<any[]> | undefined;
  homeData$: Observable<any> | undefined; // Assuming homeData might be needed for shops as well

  private selectedCategorySubject = new BehaviorSubject<string | null>('all');
  selectedCategory$ = this.selectedCategorySubject.asObservable();

  constructor(private apiService: ApiService) {
    addIcons({ language, cart, chevronDown, flag, notificationsOutline, mapOutline, menuOutline, searchOutline, globeOutline });
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

    this.shops$ = this.apiService.getShops().pipe(
      map((response: any) => { // Cast response to any
        console.log('Shops (parsed):', JSON.stringify(response, null, 2));
        return response.shops;
      })
    );

    this.filteredShops$ = combineLatest([
      this.shops$.pipe(startWith([])),
      this.selectedCategory$.pipe(startWith('all'))
    ]).pipe(
      map(([shops, selectedCategory]) => {
        if (selectedCategory === 'all') {
          return shops;
        } else {
          return shops.filter((shop: any) => shop && shop.category_id?.toString() === selectedCategory); // Add null check for shop
        }
      })
    );
  }

  onCategoryChange(event: any) {
    this.selectedCategory = event.detail.value;
    console.log('Selected Category:', this.selectedCategory);
    this.selectedCategorySubject.next(this.selectedCategory);
  }

  selectLanguage(language: any) {
    console.log('Attempting to set language:', language);
    this.selectedLanguage = language.context_key.toUpperCase();
    this.isLanguageOpen = false;
    this.apiService.setLanguage(language.context_key).subscribe((response: any) => { // Cast response to any
      console.log('Language set API response:', response);
      this.categories$ = this.apiService.getCategories().pipe(map((res: any) => res.categories)); // Cast res to any
      this.shops$ = this.apiService.getShops().pipe(map((res: any) => res.shops)); // Cast res to any
    });
  }

  selectCountry(country: any) {
    console.log('Attempting to set country:', country);
    this.selectedCountry = country.name;
    this.isCountryOpen = false;
    this.apiService.setCountry(country.country_id).subscribe((response: any) => { // Cast response to any
      console.log('Country set API response:', response);
      this.categories$ = this.apiService.getCategories().pipe(map((res: any) => res.categories)); // Cast res to any
      this.shops$ = this.apiService.getShops().pipe(map((res: any) => res.shops)); // Cast res to any
    });
  }
}
