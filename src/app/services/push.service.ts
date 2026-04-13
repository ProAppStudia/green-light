import { Injectable } from '@angular/core';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { ApiService } from './api';
import { environment } from 'src/environments/environment';

interface PushNotificationSchema {
  title?: string;
  body?: string;
  data?: Record<string, unknown>;
}

interface PushNotificationToken {
  value: string;
}

interface FirebaseMessagingPlugin {
  requestPermissions(): Promise<{ receive: 'granted' | 'denied' }>;
  getToken(): Promise<PushNotificationToken>;
  addListener(
    eventName: 'notificationReceived' | 'notificationActionPerformed' | 'tokenReceived',
    listenerFunc: (event: unknown) => void,
  ): Promise<{ remove: () => Promise<void> }>;
}

const FirebaseMessaging = registerPlugin<FirebaseMessagingPlugin>('FirebaseMessaging');

@Injectable({
  providedIn: 'root'
})
export class PushService {
  private initialized = false;

  constructor(private api: ApiService) {}

  async initialize(): Promise<void> {
    if (this.initialized || !environment.firebase.enabled) {
      return;
    }

    if (!Capacitor.isNativePlatform()) {
      console.info('[Push] native platform required, skip initialization');
      return;
    }

    this.initialized = true;

    try {
      const permissions = await FirebaseMessaging.requestPermissions();
      if (permissions.receive !== 'granted') {
        console.warn('[Push] permission denied');
        return;
      }

      await this.bindListeners();
      await this.syncToken();
    } catch (error) {
      console.error('[Push] initialization failed. Install/configure Firebase native plugin first.', error);
    }
  }

  async syncToken(): Promise<void> {
    try {
      const token = await FirebaseMessaging.getToken();
      if (!token?.value) {
        return;
      }

      this.api.saveDeviceToken({
        token: token.value,
        platform: Capacitor.getPlatform(),
        provider: 'firebase',
      }).subscribe({
        error: (error) => console.error('[Push] saveDeviceToken failed', error),
      });
    } catch (error) {
      console.error('[Push] getToken failed', error);
    }
  }

  private async bindListeners(): Promise<void> {
    await FirebaseMessaging.addListener('notificationReceived', (notification) => {
      void notification;
    });

    await FirebaseMessaging.addListener('notificationActionPerformed', (notification) => {
      void notification;
    });

    await FirebaseMessaging.addListener('tokenReceived', (token) => {
      void token;
      void this.syncToken();
    });
  }
}
