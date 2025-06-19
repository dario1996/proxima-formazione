/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';

declare const google: any;

@Injectable({
  providedIn: 'root',
})
export class GoogleAuthService {
  private clientId =
    '213275704338-r4rg2b08qukt0040q7l8kl7cm8hnl4vg.apps.googleusercontent.com';
  private tokenClient: any;
  private accessToken: string | null = null;
  private user: any = null;

  constructor() {
    this.initGoogleIdentityServices();
    const savedToken = localStorage.getItem('google_access_token');
    if (savedToken) {
      this.accessToken = savedToken;
      this.fetchUserProfile(); // <-- aggiungi questa riga!
    }
  }

  // Inizializza Google Identity Services
  private initGoogleIdentityServices() {
    // Carica lo script GIS se non è già presente
    if (!document.getElementById('google-identity-service')) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.id = 'google-identity-service';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }

  // Avvia il login e ottieni l'access token
  async signIn(): Promise<string | null> {
    return new Promise((resolve, reject) => {
      // Timeout di sicurezza: dopo 60 secondi, reject
      const timeout = setTimeout(() => {
        reject('Login Google annullato o popup chiuso.');
      }, 30000);

      const waitForGoogle = () => {
        if (
          Object.prototype.hasOwnProperty.call(window, 'google') &&
          google.accounts &&
          google.accounts.oauth2
        ) {
          this.tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: this.clientId,
            scope:
              'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
            callback: async (tokenResponse: any) => {
              clearTimeout(timeout);
              if (tokenResponse && tokenResponse.access_token) {
                this.accessToken = tokenResponse.access_token;
                localStorage.setItem('google_access_token', this.accessToken!);
                await this.fetchUserProfile();
                resolve(this.accessToken!);
              } else {
                resolve(null); // login annullato
              }
            },
          });
          this.tokenClient.requestAccessToken();
        } else {
          setTimeout(waitForGoogle, 100);
        }
      };
      waitForGoogle();
    });
  }

  // Recupera info profilo utente Google
  private async fetchUserProfile() {
    if (!this.accessToken) return;
    const response = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      },
    );
    if (response.ok) {
      this.user = await response.json();
    }
  }

  // Logout: elimina token e utente
  signOut() {
    this.accessToken = null;
    this.user = null;
    localStorage.removeItem('google_access_token');
  }

  // Verifica se l'utente è autenticato
  /**
   * Controlla se l'utente è autenticato localmente (token presente)
   */
  isSignedIn(): boolean {
    return !!this.accessToken;
  }

  /**
   * Controlla se il token è valido presso Google (non scaduto/revocato)
   */
  async isTokenValid(): Promise<boolean> {
    if (!this.accessToken) return false;
    try {
      const response = await fetch(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        },
      );
      return response.status !== 401;
    } catch {
      return false;
    }
  }

  // Ottieni info utente Google loggato
  getUser() {
    return this.user;
  }

  // Inserisci un evento su Google Calendar
  async insertEvent(event: any): Promise<any> {
    if (!this.accessToken) throw new Error('Non autenticato');
    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      },
    );
    if (!response.ok) throw new Error('Errore inserimento evento');
    return response.json();
  }

  async listEvents(): Promise<any[]> {
    if (!this.accessToken) throw new Error('Non autenticato');
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?singleEvents=true&orderBy=startTime`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      },
    );
    if (!response.ok) throw new Error('Errore nel recupero eventi');
    const data = await response.json();
    return data.items;
  }

  // Modifica un evento su Google Calendar
  async updateEvent(eventId: string, event: any): Promise<any> {
    if (!this.accessToken) throw new Error('Non autenticato');
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      },
    );
    if (!response.ok) throw new Error('Errore modifica evento');
    return response.json();
  }

  // Elimina un evento su Google Calendar
  async deleteEvent(eventId: string): Promise<void> {
    if (!this.accessToken) throw new Error('Non autenticato');
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      },
    );
    if (!response.ok) throw new Error('Errore eliminazione evento');
  }

  // Recupera un evento specifico (anche il master di una serie ricorrente)
  async getEvent(eventId: string): Promise<any> {
    if (!this.accessToken) throw new Error('Non autenticato');
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      },
    );
    if (!response.ok) throw new Error('Errore nel recupero evento');
    return response.json();
  }

  // ---------- DASHBOARD ----------

  // Recupera solo gli eventi della settimana corrente (lunedì-domenica)
  async getEventsThisWeek(): Promise<any[]> {
    if (!this.accessToken) throw new Error('Non autenticato');

    // Calcola inizio e fine settimana (lunedì-domenica)
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // Lunedì
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?singleEvents=true&orderBy=startTime&timeMin=${encodeURIComponent(
      startOfWeek.toISOString(),
    )}&timeMax=${encodeURIComponent(endOfWeek.toISOString())}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });
    if (!response.ok) throw new Error('Errore nel recupero eventi');
    const data = await response.json();
    return data.items || [];
  }

  // Recupera solo gli eventi di oggi DOPO l'orario corrente
  async getEventsTodayAfterNow(): Promise<any[]> {
    if (!this.accessToken) throw new Error('Non autenticato');

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?singleEvents=true&orderBy=startTime&timeMin=${encodeURIComponent(
      startOfDay.toISOString(),
    )}&timeMax=${encodeURIComponent(endOfDay.toISOString())}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });
    if (!response.ok) throw new Error('Errore nel recupero eventi');
    const data = await response.json();

    // Mostra solo eventi che NON sono ancora terminati
    return (data.items || []).filter(
      (ev: { end: { dateTime: string | number | Date } }) => {
        if (ev.end?.dateTime) {
          return new Date(ev.end.dateTime) > now;
        }
        // Se evento all-day, puoi decidere se mostrarlo o meno
        return false;
      },
    );
  }

  // Recupera tutti gli eventi di oggi (anche passati e futuri)
  async getEventsToday(): Promise<any[]> {
    if (!this.accessToken) throw new Error('Non autenticato');

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?singleEvents=true&orderBy=startTime&timeMin=${encodeURIComponent(
      startOfDay.toISOString(),
    )}&timeMax=${encodeURIComponent(endOfDay.toISOString())}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });
    if (!response.ok) throw new Error('Errore nel recupero eventi');
    const data = await response.json();
    // Solo eventi con orario (esclude all-day, opzionale)
    return (data.items || []).filter(
      (ev: { start: { dateTime: any } }) => !!ev.start?.dateTime,
    );
  }
}
