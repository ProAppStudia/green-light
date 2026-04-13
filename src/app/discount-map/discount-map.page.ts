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
import { ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';

import { ApiService } from '../services/api';
import { AuthService } from 'src/app/services/auth.service';
//локалізація 
import { TranslateModule, TranslateService } from '@ngx-translate/core';
// Leaflet 
import * as L from 'leaflet';
import 'leaflet.markercluster';
//change icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/marker-icon-2x.png',
  iconUrl: 'assets/marker-icon.png',
  shadowUrl: 'assets/marker-shadow.png',
});

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
    if (!this.map) {
      this.initMap();
    } else {
      setTimeout(() => this.map?.invalidateSize(), 300);
    }
  }


  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService, 
    private menu: MenuController, 
    private cdr: ChangeDetectorRef,
    private router: Router,
    private auth: AuthService,
    private translate: TranslateService,
    private alertCtrl: AlertController
  ) {
    addIcons({notificationsOutline,languageOutline,mapOutline,menuOutline,searchOutline,cart,globeOutline:globeOutlineIcon});
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
console.log('Отримано category_id з query params:', categoryId);
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
  initMap() {
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
  }

  loadDiscounts(filters: any = {}) {
    // очищаємо кластер

    if (!this.markerCluster) {
      console.warn('markerCluster ще не готовий');
      return;
    }

    this.markerCluster.clearLayers();

    const markers: L.Marker[] = [];

    this.apiService.getDiscountsMap(filters).subscribe({
      next: (res:any) => {
        if(res && res.discounts){
          if(!res.discounts.length){
            this.showNoResultsAlert();
            return;
          }
          res.discounts.forEach((discount: any) => {
              if(discount.coordinates.lat && discount.coordinates.lan){
                const marker = L.marker([discount.coordinates.lat, discount.coordinates.lan]);
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
      error: (err) => {
        console.error('Помилка HTTP:', err);
      },
    });
    
  }

  async showNoResultsAlert() {
  const alert = await this.alertCtrl.create({
    header: 'Нічого не знайдено',
    message: 'За цими фільтрами знижки не мають геолокації.',
    buttons: ['OK']
  });

  await alert.present();
}

}
