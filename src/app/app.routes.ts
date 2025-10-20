import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'discount/:id',
    loadComponent: () => import('./pages/discount/discount.page').then( m => m.DiscountPage)
  },
  {
    path: 'shop/:id',
    loadComponent: () => import('./pages/shop/shop.page').then( m => m.ShopPage)
  },
  {
    path: 'category/:id',
    loadComponent: () => import('./pages/category/category.page').then( m => m.CategoryPage)
  },



];
