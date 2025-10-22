import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';


@Injectable({
  providedIn: 'root'
})
export class CacheServices {
  async set(key: string, data: any): Promise<void> {
    const payload = {
      timestamp: Date.now(),
      data
    };
    await Preferences.set({
      key,
      value: JSON.stringify(payload)
    });
  }

  async get(key: string, maxAgeHours = 5): Promise<any | null> {
    const result = await Preferences.get({ key });
    if (!result.value) return null;

    const payload = JSON.parse(result.value);
    const ageHours = (Date.now() - payload.timestamp) / (1000 * 60 * 60);

    if (ageHours > maxAgeHours) {
      // Кеш застарів
      await Preferences.remove({ key });
      return null;
    }

    return payload.data;
  }

  async clear(key: string) {
    await Preferences.remove({ key });
  }
}
