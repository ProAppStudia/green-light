import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of, from } from 'rxjs';
import { switchMap, tap, map } from 'rxjs/operators';
/*capacitor preferences cache method*/
import { CacheServices } from './cache';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'https://firstgreenlight.com/app/api.php';

  constructor(
    private http: HttpClient,
    private cache: CacheServices
  ) {}

  /*
  getHomeData(): Observable<any> {
    const url = `${this.baseUrl}?type=get_home_data`;
    const headers = new HttpHeaders({ 'Accept': 'application/json' });
    const params = new HttpParams().set('lang', 'uk').set('limit', '10');
    return this.http.get(url, { headers, params });
  }
  */

  getDiscountById(id: string) {
  const url = `${this.baseUrl}?type=getDiscount&discount_id=${id}`;
  const headers = new HttpHeaders({ 'Accept': 'application/json' });
  return this.http.get(url, { headers });
}

  setDiscountToMyList(id: string){
    const url = `${this.baseUrl}?type=add_to_my_discounts`;
    const headers = new HttpHeaders({ 'Accept': 'application/json' });
    const params = new HttpParams().set('discount_id', id);
    return this.http.get(url, { headers, params });
  }
  getShopById(id: string) {
    const url = `${this.baseUrl}?type=getShop&shop_id=${id}`;
    const headers = new HttpHeaders({ 'Accept': 'application/json' });
    return this.http.get(url, { headers });
  }

  validateCode(code: string): Observable<any> {
    const url = `${this.baseUrl}?type=validate_code`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    return this.http.post(url, {code: code}, { headers });
  }

  getItemsByCategoryId(category_id:number, page:number, limit:number){
    let url = `${this.baseUrl}?type=getCategory&category_id=${category_id}`;
    if(page){
      url += '&page='+page;
    }
    if(limit){
      url += '&limit='+limit;
    }
    const headers = new HttpHeaders({ 'Accept': 'application/json' });
    return this.http.get(url, { headers });
  }
  getItemsByKeyword(keyword:string){
    const url = `${this.baseUrl}?type=search&keyword=${keyword}`;
    return this.http.get(url);
  }
  
  getMyEarnings(){
    const url = `${this.baseUrl}?type=get_my_earnings`;
    return this.http.get(url);
  }

  getAvailableLanguages(){
    const cacheKey = 'languages';
    const maxAgeHours = 6;
    return from(this.cache.get(cacheKey, maxAgeHours)).pipe(
      switchMap(cached => {
        if (cached) {
          return of(cached);
        }
        return this.http.get(`${this.baseUrl}?type=getLanguages`).pipe(
          switchMap(async (data: any) => {
            await this.cache.set(cacheKey, data);
            return data;
          })
        );
      })
    );
  }

  getAllActiveShops(keyword:string, page:number){
    const url = `${this.baseUrl}?type=getShops&keyword=${keyword}&page=${page}`;
    const headers = new HttpHeaders({ 'Accept': 'application/json' });
    return this.http.get(url, { headers });
  }
  
  getMyName(){
    const url = `${this.baseUrl}?type=get_my_name`;
    const headers = new HttpHeaders({ 'Accept': 'application/json' });
    return this.http.get(url, { headers });
  }
  
  createPaymentLink(){
    const url = `${this.baseUrl}?type=buy_plan`;
    return this.http.get(url);
  }
  
  getMyTransactions(){
    const url = `${this.baseUrl}?type=get_my_transcations`;
    return this.http.get(url);
  }
  getMyPurchases(){
    const url = `${this.baseUrl}?type=get_my_purchases`;
    return this.http.get(url);
  }
  deleteMyPurchase(id:any): Observable<any>{
    return this.http.post(`${this.baseUrl}?type=delete_my_purchase`, {id: id});
  }
  createPayout(params:any): Observable<any>{
    return this.http.post(`${this.baseUrl}?type=create_payout`, params);
  }

  updateProfile(formData:any = {}): Observable<any> {
    return this.http.post(`${this.baseUrl}?type=update_profile`, formData);
  }
  
  getAvailableCountry(){
    const cacheKey = 'countries';
    const maxAgeHours = 6;
    return from(this.cache.get(cacheKey, maxAgeHours)).pipe(
      switchMap(cached => {
        if (cached) {
          return of(cached);
        }
        return this.http.get(`${this.baseUrl}?type=getCountries`).pipe(
          switchMap(async (data: any) => {
            await this.cache.set(cacheKey, data);
            return data;
          })
        );
      })
    );
  }

  deleteAccount(){
    const url = `${this.baseUrl}?type=delete_account`;
    return this.http.get(url);
  }

  /* 
  * FROM DIFFERENT API.SERVICES
  */
 getCategories(): Observable<any> {
     const baseDomain = this.baseUrl.substring(0, this.baseUrl.indexOf('/app/api.php'));
     return this.http.get(`${this.baseUrl}?type=getCategories`).pipe(
       map((response: any) => {
         if (response && response.categories) {
           response.categories = this.processCategoryIcons(response.categories, baseDomain);
         }
         return response;
       }),
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
     );
   }
 
   getDiscount(discountId: number): Observable<any> {
     return this.http.get(`${this.baseUrl}?type=getDiscount&discount_id=${discountId}`).pipe(
     );
   }
 
   getShop(shopId: number): Observable<any> {
     return this.http.get(`${this.baseUrl}?type=getShop&shop_id=${shopId}`).pipe(
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

  /* EXAMPLES: */
  sendForm(data: any): Observable<any> {
    const url = `${this.baseUrl}/contact-form`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    return this.http.post(url, data, { headers });
  }

  request(method: 'GET' | 'POST' | 'PUT' | 'DELETE', endpoint: string, data?: any): Observable<any> {
    const url = `${this.baseUrl}/${endpoint}`;
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });

    if (method === 'GET') {
      return this.http.get(url, { headers, params: new HttpParams({ fromObject: data || {} }) });
    }

    return this.http.request(method, url, { headers, body: data });
  }
}
