import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'https://firstgreenlight.com/app/api.php'; //

  constructor(private http: HttpClient) {}

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
