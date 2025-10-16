import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton, IonButton, IonIcon, IonSegment, IonSegmentButton, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonPopover, IonList, IonItem } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { language, cart, chevronDown, flag } from 'ionicons/icons';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { ApiService } from '../services/api';
import { Router } from '@angular/router';

// Import Swiper modules
import { register } from 'swiper/element/bundle';
// Register Swiper custom elements
register();

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  category_id:number;
  discount_id:number;
  percent:string;
}

interface Slide {
  photo: string;
  title: string;
  address: string;
  discount: number;
  discount_id: number;
}

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton, IonButton, IonIcon, IonSegment, IonSegmentButton, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonPopover, IonList, IonItem, FormsModule, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class Tab1Page implements OnInit {
  selectedLanguage = 'EN';
  selectedCountry = 'Ukraine';
  selectedCategory = 'all';
  isLanguageOpen = false;
  isCountryOpen = false;

  slides: Slide[] = [
    {
      photo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
      title: 'Restaurant Name 1',
      address: '123 Main St, City, Country',
      discount: 25,
      discount_id: 0,
    }
  ];

  products: Product[] = [
    {
      id: 1,
      name: 'iPhone 15 Pro',
      category_id: 0,
      category: '',
      price: 999,
      discount_id:0,
      description: 'Latest iPhone with advanced camera system',
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=200&fit=crop',
      percent: '',
    }
  ];

  main_categories = [
    {
      name : null, 
      icon: null, 
      category_id : 0
    }
  ];

  filteredProducts: Product[] = [];

  constructor(
    private api: ApiService,
    private router: Router
  ) {
    addIcons({ language, cart, chevronDown, flag });
  }

  ngOnInit() {
    this.filteredProducts = this.products;

    this.api.getHomeData().subscribe({
      next: (res) => {
        if(res.slider){
          this.slides = res.slider;
        }
        if(res.discounts_to_categories){
          this.main_categories = res.discounts_to_categories;
        }
        
        if(res.products_to_cat){
          this.filteredProducts = res.products_to_cat;
          this.products = res.products_to_cat;
        }
        
      },
      error: (err) => console.error('Помилка GET:', err)
    });

  }

  onCategoryChange(event: any) {
    const category_id = event.detail.value;
    
    this.selectedCategory = category_id;

    if (category_id === 'all') {
      this.filteredProducts = this.products;
    } else {
      this.filteredProducts = this.products.filter(product => product.category_id == category_id);
    }
  }

  selectLanguage(language: string) {
    this.selectedLanguage = language;
    this.isLanguageOpen = false;
    console.log('Language changed to:', language);
  }

  selectCountry(country: string) {
    this.selectedCountry = country;
    this.isCountryOpen = false;
    console.log('Country changed to:', country);
  }

  openDiscount(discount_id: number){
    this.router.navigate(['/discount', discount_id]);
  }

}
