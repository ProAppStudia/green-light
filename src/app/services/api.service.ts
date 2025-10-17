import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'https://firstgreenlight.com/app/api.php';

  constructor(private http: HttpClient) { }

  getCategories(): Observable<any> {
    const baseDomain = this.baseUrl.substring(0, this.baseUrl.indexOf('/app/api.php'));
    return this.http.get(`${this.baseUrl}?type=getCategories`).pipe(
      map((response: any) => {
        if (response && response.categories) {
          response.categories = this.processCategoryIcons(response.categories, baseDomain);
        }
        return response;
      }),
      tap(response => console.log('API: getCategories processed response:', response))
    );
  }

  private processCategoryIcons(categories: any[], baseDomain: string): any[] {
    return categories.map(category => {
      if (category.icon && !category.icon.startsWith('http')) {
        category.icon = `${baseDomain}${category.icon}`;
      }
      if (category.child && category.child.length > 0) {
        category.child = this.processCategoryIcons(category.child, baseDomain);
      }
      return category;
    });
  }

  getCategoryDiscounts(categoryId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}?type=getCategory&category_id=${categoryId}`).pipe(
      tap(response => console.log(`API: getCategoryDiscounts for category ${categoryId} raw response:`, response))
    );
  }

  getDiscount(discountId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}?type=getDiscount&discount_id=${discountId}`).pipe(
      tap(response => console.log(`API: getDiscount for ID ${discountId} raw response:`, response))
    );
  }

  getShop(shopId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}?type=getShop&shop_id=${shopId}`).pipe(
      tap(response => console.log(`API: getShop for ID ${shopId} raw response:`, response))
    );
  }

  getCountries(): Observable<any> {
    return this.http.get(`${this.baseUrl}?type=getCountries`).pipe(
      tap(response => console.log('API: getCountries raw response:', response))
    );
  }

  getLanguages(): Observable<any> {
    return this.http.get(`${this.baseUrl}?type=getLanguages`).pipe(
      tap(response => console.log('API: getLanguages raw response:', response))
    );
  }

  setLanguage(contextKey: string): Observable<any> {
    return this.http.post(`${this.baseUrl}?type=set_language`, { contextKey }).pipe(
      tap(response => console.log(`API: setLanguage for ${contextKey} raw response:`, response))
    );
  }

  setCountry(countryId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}?type=set_country`, { country_id: countryId }).pipe(
      tap(response => console.log(`API: setCountry for ID ${countryId} raw response:`, response))
    );
  }

  getHomeData(): Observable<any> {
    return this.http.get(`${this.baseUrl}?type=get_home_data`).pipe(
      tap(response => console.log('API: getHomeData raw response:', response))
    );
  }

  getShops(): Observable<any> {
    return this.http.get(`${this.baseUrl}?type=getShops`).pipe(
      tap(response => console.log('API: getShops raw response:', response))
    );
  }
}
