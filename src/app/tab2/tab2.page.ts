import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton, IonButton, IonIcon, IonSegment, IonSegmentButton, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonPopover, IonList, IonItem, MenuController } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { language, cart, chevronDown, flag, notificationsOutline, mapOutline, menuOutline, searchOutline, globeOutline, languageOutline, listOutline, gridOutline } from 'ionicons/icons';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ApiService } from '../services/api';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, switchMap, startWith } from 'rxjs/operators';

import { AuthService } from 'src/app/services/auth.service';

import { Router } from '@angular/router';

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
  isLoading = false;
  page = 1;
  totalPages = 1;
  count_shops = 1;
  keyword:any = '';
  viewMode = 'list';
  //end for header

  selectedCategory: string | null = 'all'; // Initialize with 'all'
 
  shops$: any[] = [];

  constructor(
    private api: ApiService,
    private menu: MenuController,
    private router: Router,
    private auth: AuthService
  ) {
    addIcons({ language, cart, chevronDown, flag, notificationsOutline, mapOutline, menuOutline, searchOutline, globeOutline, languageOutline, listOutline, gridOutline });
  }

  ngOnInit() {
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
    // FOR header підставити активну мову
    // ПОтрібно використати .then, бо це promise а не переміна, тож потрібно дочекатись відповіді
    this.auth.getLanguage().then(lang_code => {
      if (lang_code !== null) {
        this.selectedLanguage = lang_code.toUpperCase();
      }
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

    this.auth.getCountry().then(country_id => {
      if (country_id !== null) {
        this.countries$?.forEach((element:any) => {
            if(element.country_id == country_id){
              this.selectedCountry = element.name;
            }
        });
      }
    });

    this.resetAndLoad();
    
  }

  resetAndLoad() {
    this.shops$ = [];
    this.page = 1;
    this.totalPages = 1;
    this.loadShops();
  }

  async loadShops() {
    if (this.isLoading || (this.page > this.totalPages)) return;
    this.isLoading = true;

      try {
        this.api.getAllActiveShops(this.keyword, this.page).subscribe({
          next: (res:any) => {
            if(res){
              this.shops$ = [...this.shops$, ...res.shops];
              this.totalPages = res.total_pages || 1;
              this.count_shops = res.count_shops || 0;
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

  loadMore() {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadShops();
    }
  }

  searchByKeyword(event: CustomEvent){
    const value = String((event.target as HTMLIonInputElement).value ?? '');
    if(value.length > 4){
      this.keyword = value;
      this.page = 1;
      this.loadShops();
    }else if(value == ''){
      this.keyword = '';
      this.page = 1;
      this.loadShops();
    }
  }

  toggleView(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }

  openShop(shop_id: number){
    this.router.navigate(['/tabs/shop', shop_id]);
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
    this.auth.saveLanguage(language.context_key);
    this.selectedLanguage = language.context_key.toUpperCase();
  }
  
  selectCountry(country: any) {
    this.auth.saveCountry(country.country_id);
    this.selectedCountry = country.name;
  }
  //end for header
}
