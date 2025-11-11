import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
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

  getHomeData(): Observable<any> {
    const url = `${this.baseUrl}?type=get_home_data`;
    const headers = new HttpHeaders({ 'Accept': 'application/json' });
    const params = new HttpParams().set('lang', 'uk').set('limit', '10');
    return this.http.get(url, { headers, params });
  }

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
  getItemsByKeyword(keyword:string, page:number, limit:number){

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
