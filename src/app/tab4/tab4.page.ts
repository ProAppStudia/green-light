import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { Component, OnInit } from '@angular/core';
import { IonHeader,IonFooter, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton, IonButton, IonIcon, IonSegment, IonSegmentButton, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonPopover, IonList, IonItem, MenuController } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { language, cart, chevronDown, flag, notificationsOutline, mapOutline, menuOutline, searchOutline, globeOutline, languageOutline, listOutline, gridOutline, pencilOutline, barChartOutline, cartOutline } from 'ionicons/icons';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ApiService } from '../services/api';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, switchMap, startWith } from 'rxjs/operators';
import { Preferences } from '@capacitor/preferences';

import { AuthService } from 'src/app/services/auth.service';

import { Router } from '@angular/router';

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss'],
  imports: [IonFooter, IonHeader, IonToolbar, IonTitle, IonContent, IonMenuButton, IonButton, IonSegment, IonSegmentButton, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonPopover, IonList, IonItem, FormsModule, CommonModule, IonButtons, IonMenuButton, IonButton, IonIcon, ExploreContainerComponent],
})
export class Tab4Page {
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
  fullname: any | '';


  constructor(
    private api: ApiService,
    private menu: MenuController,
    private router: Router,
    private auth: AuthService
  ) {
    addIcons({ language, cart, chevronDown, flag, notificationsOutline, mapOutline, menuOutline, searchOutline, globeOutline, languageOutline, pencilOutline, barChartOutline, listOutline, cartOutline });
  }

  async ngOnInit() {
    const { value: token } = await Preferences.get({ key: 'auth_token' });
    
    if (!token) {
      this.router.navigate(['/auth'], { replaceUrl: true });
    }

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

    this.api.getMyName().subscribe({
      next: (res:any) => {
        if(typeof res.success != 'undefined'){
          this.fullname = res.fullname;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });

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
