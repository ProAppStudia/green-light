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

];
