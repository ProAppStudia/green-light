import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton, IonButton, IonIcon, IonSegment, IonSegmentButton, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonPopover, IonList, IonItem, MenuController } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { language, cart, chevronDown, flag, notificationsOutline, mapOutline, menuOutline, searchOutline, globeOutline, languageOutline } from 'ionicons/icons';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ApiService } from '../services/api';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, switchMap, startWith } from 'rxjs/operators';

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
  //end for header

  selectedCategory: string | null = 'all'; // Initialize with 'all'
 
  shops$: any | [];

  constructor(
    private api: ApiService,
    private menu: MenuController,
    private router: Router,
  ) {
    addIcons({ language, cart, chevronDown, flag, notificationsOutline, mapOutline, menuOutline, searchOutline, globeOutline, languageOutline });
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

    this.loadShops();
    
  }
  async loadShops() {
    if (this.isLoading || (this.page > this.totalPages)) return;
    this.isLoading = true;

      try {
        this.api.getAllActiveShops(this.keyword, this.page).subscribe({
          next: (res:any) => {
            if(res){
              this.shops$ = [...res.shops];
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
      console.log('Attempting to set language:', language);
      
    }
  
    selectCountry(country: any) {
      console.log('Attempting to set country:', country);
      
    }
  //end for header
}
