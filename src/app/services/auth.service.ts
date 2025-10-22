import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'https://firstgreenlight.com/app/api.php';

  constructor(private http: HttpClient) {}

  // 🔹 Логін
  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}?type=login`, { username: username, password: password });
  }

  // 🔹 Реєстрація
  register(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}?type=register`, data);
  }

  // 🔹 Збереження токена
  async saveToken(token: string) {
    await Preferences.set({ key: 'auth_token', value: token });
  }

  // 🔹 Отримати токен
  async getToken(): Promise<string | null> {
    const { value } = await Preferences.get({ key: 'auth_token' });
    return value;
  }

  // 🔹 Видалити токен (вихід)
  async logout() {
    await Preferences.remove({ key: 'auth_token' });
  }
}
