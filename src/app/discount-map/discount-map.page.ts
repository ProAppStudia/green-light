import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonPopover, IonList, IonItem, MenuController } from '@ionic/angular/standalone'; // Removed IonMenuButton
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { notificationsOutline, languageOutline, globeOutline, menuOutline, searchOutline, mapOutline, cart, arrowBackOutline } from 'ionicons/icons';
import { globeOutline as globeOutlineIcon } from 'ionicons/icons'; // Alias for globeOutline if needed elsewhere
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest, forkJoin, of, Subject } from 'rxjs';
import { map, switchMap, startWith, tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CategoriesGridComponent } from '../components/categories-grid/categories-grid.component'; // Import the new component

/*import { ApiService } from '../services/api.service'; // old one*/
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { AlertController } from '@ionic/angular';

import { ApiService } from '../services/api';
import { AuthService } from 'src/app/services/auth.service';
//локалізація 
import { TranslateModule, TranslateService } from '@ngx-translate/core';
// Leaflet
import * as L from 'leaflet';

@Component({
  selector: 'app-discount-map',
  templateUrl: './discount-map.page.html',
  styleUrls: ['./discount-map.page.scss'],
  standalone: true,
  imports: [TranslateModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonPopover, IonList, IonItem, FormsModule, CommonModule, CategoriesGridComponent]
})
export class DiscountMapPage implements OnInit {

  selectedLanguage = 'UA';
  selectedCountry = 'Ukraine';
  isLanguageOpen = false;
  isCountryOpen = false;

  categories$: Observable<any[]> | undefined;
  countries$: any | [];
  languages$: any | [];

  hideHeader = false;
  isScrolled = false;
  lastScrollTop = 0;

  category_id: string | any = 0;

  map!: L.Map;
  markerCluster!: any;

  ionViewDidEnter() {
    setTimeout(() => {
      if (!this.map) {
        this.initMap();
      } else {
        this.map?.invalidateSize();
      }
    }, 300);
  }


  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService, 
    private menu: MenuController, 
    private cdr: ChangeDetectorRef,
    private router: Router,
    private location: Location,
    private auth: AuthService,
    private translate: TranslateService,
    private alertCtrl: AlertController
  ) {
    addIcons({notificationsOutline,languageOutline,mapOutline,menuOutline,searchOutline,cart,arrowBackOutline,globeOutline:globeOutlineIcon});
    translate.use('ua');
  }

  /*
  змінити роут категорії 
  this.router.navigate([], {
  queryParams: { category: 7 },
  queryParamsHandling: 'merge'
});
  */

  ngOnInit() {
    this.category_id = this.route.snapshot.queryParamMap.get('category');

    this.route.queryParamMap.subscribe(params => {
      const categoryId = Number(params.get('category'));
      if (categoryId) {
        this.loadDiscounts({ category_id: categoryId });
      } else {
        this.loadDiscounts();
      }
    })

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
        this.translate.use(lang_code);
      }
    });
    //new lines
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

  goBack() {
    this.location.back();
  }

  openMenu() {
    this.menu.open('main-menu'); // 'main-menu' is the ID of the ion-menu
  }

  selectLanguage(language: any) {
    this.auth.saveLanguage(language.context_key);
    this.selectedLanguage = language.context_key.toUpperCase();
    this.translate.use(language.context_key);
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

  //leaflet map initialization
  async initMap() {
    try {
      // Встановлюємо window.L ДО імпорту плагіну,
      // щоб leaflet.markercluster (UMD) прикріпився до правильного екземпляра L
      (window as any).L = L;
      await import('leaflet.markercluster');

      this.map = L.map('map').setView([50.4501, 30.5234], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.map);

      // Кластер
      this.markerCluster = (L as any).markerClusterGroup({
        showCoverageOnHover: false,
        maxClusterRadius: 50
      });

      this.map.addLayer(this.markerCluster);

      this.loadDiscounts();
    } catch (err) {
      console.error('initMap error:', JSON.stringify(err), err);
    }
  }

  loadDiscounts(filters: any = {}) {
    // очищаємо кластер

    if (!this.markerCluster) {
      console.warn('markerCluster ще не готовий');
      return;
    }

    this.markerCluster.clearLayers();

    const markers: L.Marker[] = [];

    // Завжди передаємо contextKey для коректної роботи на мобільному
    const contextKey = (this.selectedLanguage || 'UA').toLowerCase();
    const apiFilters = { contextKey, ...filters };

    this.apiService.getDiscountsMap(apiFilters).subscribe({
      next: (res:any) => {
        if(res && res.discounts){
          if(!res.discounts.length){
            this.showNoResultsAlert();
            return;
          }
          res.discounts.forEach((discount: any) => {
              const lat = parseFloat(discount.coordinates?.lat);
              const lan = parseFloat(discount.coordinates?.lan);
              if(!isNaN(lat) && !isNaN(lan) && lat !== 0 && lan !== 0){
                const greenIcon = L.divIcon({
                  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36"><path fill="#2dc96e" stroke="#fff" stroke-width="0.8" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
                  className: '',
                  iconSize: [36, 36],
                  iconAnchor: [18, 36],
                  popupAnchor: [0, -36]
                });
                const marker = L.marker([lat, lan], { icon: greenIcon });
                const popupContent = `
                  <div class="custom-popup">
                    <img src="${discount.image}" />
                    <div class="content">
                      <div class="title">${discount.name}</div>
                      <div class="date">${discount.date_start} - ${discount.date_end}</div>
                      <div class="address">${discount.address}</div>
                      <a class="btn" href="/discount/${discount.discount_id}">
                        ${this.translate.instant('TEXT_DETAILS')}
                      </a>
                    </div>
                  </div>
                `;
                marker.bindPopup(popupContent, {
                  className: 'ionic-popup'
                });
                markers.push(marker);
              }
          })
          // додаємо всі маркери в кластер
          this.markerCluster.addLayers(markers);
          if (markers.length) {
            const group = L.featureGroup(markers);
            this.map.fitBounds(group.getBounds(), {
              padding: [50, 50],
              maxZoom: 16
            });
          }
        }
      },
      error: async (err) => {
        console.error('Помилка HTTP:', err);
        const alert = await this.alertCtrl.create({
          header: 'Помилка',
          message: 'Не вдалося завантажити дані карти. Перевірте з\'єднання.',
          buttons: ['OK']
        });
        await alert.present();
      },
    });

  }

  async showNoResultsAlert() {
  const alert = await this.alertCtrl.create({
    header: this.translate.instant('TEXT_NOT_FOUND'),
    message: this.translate.instant('TEXT_DISCOUNT_WITHOUT_GEO'),
    buttons: ['OK']
  });

  await alert.present();
}

}
