import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton, IonButton, IonIcon, IonSegment, IonSegmentButton, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonPopover, IonList, IonItem } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { notificationsOutline, languageOutline, globeOutline, menuOutline, searchOutline } from 'ionicons/icons';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

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
}

interface Slide {
  photo: string;
  title: string;
  address: string;
  discount: number;
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
  hideHeader = false;
  isScrolled = false;
  lastScrollTop = 0;

  slides: Slide[] = [
    {
      photo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
      title: 'Restaurant Name 1',
      address: '123 Main St, City, Country',
      discount: 25,
    },
    {
      photo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
      title: 'Cafe Cool',
      address: '456 Oak Ave, Town, Country',
      discount: 15,
    },
    {
      photo: 'https://images.unsplash.com/photo-1579731118440-8c3a831d5393?w=400&h=300&fit=crop',
      title: 'The Grand Hotel',
      address: '789 Pine Rd, Village, Country',
      discount: 30,
    },
  ];

  products: Product[] = [
    {
      id: 1,
      name: 'iPhone 15 Pro',
      category: 'electronics',
      price: 999,
      description: 'Latest iPhone with advanced camera system',
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=200&fit=crop'
    },
    {
      id: 2,
      name: 'MacBook Air',
      category: 'electronics',
      price: 1299,
      description: 'Powerful laptop with M2 chip',
      image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=300&h=200&fit=crop'
    },
    {
      id: 3,
      name: 'Nike Air Max',
      category: 'clothing',
      price: 129,
      description: 'Comfortable running shoes',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=200&fit=crop'
    },
    {
      id: 4,
      name: 'Denim Jacket',
      category: 'clothing',
      price: 89,
      description: 'Classic denim jacket for any season',
      image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5c?w=300&h=200&fit=crop'
    },
    {
      id: 5,
      name: 'The Great Gatsby',
      category: 'books',
      price: 15,
      description: 'Classic American novel',
      image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=200&fit=crop'
    },
    {
      id: 6,
      name: 'Programming Guide',
      category: 'books',
      price: 45,
      description: 'Complete guide to modern programming',
      image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&h=200&fit=crop'
    },
    {
      id: 7,
      name: 'Tennis Racket',
      category: 'sports',
      price: 199,
      description: 'Professional tennis racket',
      image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=200&fit=crop'
    },
    {
      id: 8,
      name: 'Yoga Mat',
      category: 'sports',
      price: 35,
      description: 'Premium yoga mat for daily practice',
      image: 'https://images.unsplash.com/photo-1506629905135-cb8ecb3a8c10?w=300&h=200&fit=crop'
    }
  ];

  filteredProducts: Product[] = [];

  constructor() {
    addIcons({ notificationsOutline, languageOutline, globeOutline, menuOutline, searchOutline });
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
    this.filteredProducts = this.products;
  }

  onCategoryChange(event: any) {
    const category = event.detail.value;
    this.selectedCategory = category;

    if (category === 'all') {
      this.filteredProducts = this.products;
    } else {
      this.filteredProducts = this.products.filter(product => product.category === category);
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
}
