import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Preferences } from '@capacitor/preferences';
import { environment } from 'src/environments/environment';

export interface RealtimeMessageEvent {
  type: string;
  payload: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class RealtimeService {
  private socket: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private manuallyClosed = false;

  readonly isConnected$ = new BehaviorSubject<boolean>(false);
  readonly events$ = new Subject<RealtimeMessageEvent>();

  async connect(): Promise<void> {
    if (!environment.realtime.enabled) {
      return;
    }

    if (!environment.realtime.websocketUrl) {
      console.warn('[Realtime] websocketUrl is empty. Set it in environment.ts/environment.prod.ts');
      return;
    }

    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const { value: token } = await Preferences.get({ key: 'auth_token' });
    if (!token) {
      return;
    }

    this.manuallyClosed = false;

    try {
      const url = new URL(environment.realtime.websocketUrl);
      url.searchParams.set('token', token);

      this.socket = new WebSocket(url.toString());

      this.socket.onopen = () => {
        this.isConnected$.next(true);
      };

      this.socket.onmessage = (event: MessageEvent) => {
        try {
          const parsed = JSON.parse(event.data);
          this.events$.next({
            type: parsed?.type ?? 'message',
            payload: parsed?.payload ?? parsed,
          });
        } catch {
          this.events$.next({
            type: 'raw',
            payload: event.data,
          });
        }
      };

      this.socket.onerror = (error) => {
        console.error('[Realtime] socket error', error);
      };

      this.socket.onclose = () => {
        this.socket = null;
        this.isConnected$.next(false);

        if (!this.manuallyClosed) {
          this.scheduleReconnect();
        }
      };
    } catch (error) {
      console.error('[Realtime] connect failed', error);
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    this.manuallyClosed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected$.next(false);
  }

  send(type: string, payload: unknown): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('[Realtime] send skipped, socket is not open');
      return;
    }

    this.socket.send(JSON.stringify({ type, payload }));
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return;
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      void this.connect();
    }, environment.realtime.reconnectIntervalMs);
  }
}
