import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnInit,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { GoogleAuthService } from '../../../../core/services/google-auth.service';
import { ClientiService } from '../../../../core/services/data/clienti.service';
import { NegoziService } from '../../../../core/services/data/negozi.service';
import { firstValueFrom, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { VenditeService } from '../../../../core/services/data/vendite.service';

Chart.register(...registerables);

@Component({
  selector: 'app-home-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-dashboard.component.html',
  styleUrls: ['./home-dashboard.component.css'],
})
export class HomeDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('barChartCanvas') barChartCanvas!: ElementRef<HTMLCanvasElement>;
  barChart!: Chart;

  private googleAuth = inject(GoogleAuthService);

  isGoogleAuthenticated = false;
  loading = true;
  error = '';
  events: any[] = [];
  upcomingEventsToday: any[] = [];
  eventsToday: any[] = [];
  clientiTotali: number = 0;
  prodottiVendutiOggi: number = 0;

  now: Date = new Date();
  private timer: any;
  private negozioSub?: Subscription;

  constructor(
    private route: Router,
    private clientiService: ClientiService,
    public negozi: NegoziService,
    private cdr: ChangeDetectorRef, // <--- aggiungi questo
    private venditeService: VenditeService,
  ) {}

  async ngOnInit() {
    const tokenValid = await this.googleAuth.isTokenValid();
    this.isGoogleAuthenticated = this.googleAuth.isSignedIn() && tokenValid;

    // Se autenticato, carica i dati (spinner resta attivo)
    if (this.isGoogleAuthenticated) {
      this.negozioSub = this.negozi.negozioSelezionato$.subscribe(
        async negozio => {
          if (negozio) {
            this.loading = true; // <--- AGGIUNGI QUESTA RIGA
            this.clientiService.getListaClienti(negozio.shopId).subscribe({
              next: clienti => (this.clientiTotali = clienti.length),
              error: () => (this.clientiTotali = 0),
            });
            this.venditeService
              .getProdottiVendutiOggi(negozio.shopId)
              .subscribe({
                next: n => (this.prodottiVendutiOggi = n),
                error: () => (this.prodottiVendutiOggi = 0),
              });
            await this.caricaDatiGoogle(negozio.shopId);
            this.loading = false;
            this.cdr.detectChanges();
            setTimeout(() => this.renderChart());
          }
        },
      );
    } else {
      // Non autenticato: spinner off, mostra login
      this.loading = false;
    }

    this.timer = setInterval(() => {
      this.now = new Date();
    }, 1000);
  }

  ngAfterViewInit() {
    // Se vuoi, puoi chiamare renderChart qui per il primo rendering
    setTimeout(() => this.renderChart());
  }

  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    if (this.negozioSub) {
      this.negozioSub.unsubscribe();
    }
  }

  renderChart() {
    // Distruggi sempre il grafico precedente
    if (this.barChart) {
      this.barChart.destroy();
      this.barChart = undefined as any;
    }

    // Se non autenticato o canvas mancante, esci
    if (!this.isGoogleAuthenticated || !this.barChartCanvas) {
      return;
    }

    // Se non ci sono dati, esci dopo aver distrutto il grafico
    // (il messaggio verrà mostrato dal template)
    if (!this.events.length) {
      return;
    }

    const counts = [0, 0, 0, 0, 0, 0, 0];
    this.events.forEach(event => {
      const dateStr = event.start?.dateTime || event.start?.date;
      if (!dateStr) return;
      const date = new Date(dateStr);
      const day = (date.getDay() + 6) % 7;
      counts[day]++;
    });

    const config: ChartConfiguration = {
      type: 'bar' as ChartType,
      data: {
        labels: [
          'Lunedì',
          'Martedì',
          'Mercoledì',
          'Giovedì',
          'Venerdì',
          'Sabato',
          'Domenica',
        ],
        datasets: [
          {
            label: 'Appuntamenti',
            data: counts,
            backgroundColor: '#3f51b5',
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Appuntamenti per giorno (Settimana corrente)',
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
              stepSize: 1,
            },
          },
        },
      },
    };
    this.barChart = new Chart(this.barChartCanvas.nativeElement, config);
  }

  private eventHasShopId(ev: any, shopId: string): boolean {
    if (!ev.description || !shopId) return false;
    try {
      const desc = ev.description.startsWith('{')
        ? JSON.parse(ev.description)
        : {};
      return desc.shopId === shopId;
    } catch {
      return false;
    }
  }

  async doGoogleLogin() {
    try {
      this.loading = true;
      const token = await this.googleAuth.signIn();

      if (!token) {
        this.error = 'Login Google annullato, chiuso o scaduto.';
        this.isGoogleAuthenticated = false;
        this.loading = false;
        return;
      }

      this.isGoogleAuthenticated = true;
      const negozio = await firstValueFrom(this.negozi.negozioSelezionato$);
      if (negozio) {
        await this.caricaDatiGoogle(negozio.shopId);
        this.clientiService.getListaClienti(negozio.shopId).subscribe({
          next: clienti => (this.clientiTotali = clienti.length),
          error: () => (this.clientiTotali = 0),
        });
        this.venditeService.getProdottiVendutiOggi(negozio.shopId).subscribe({
          next: n => (this.prodottiVendutiOggi = n),
          error: () => (this.prodottiVendutiOggi = 0),
        });
      }
      this.loading = false;
      this.cdr.detectChanges();
      setTimeout(() => this.renderChart());
    } catch (err) {
      this.error =
        typeof err === 'string' ? err : 'Login Google annullato o fallito.';
      this.isGoogleAuthenticated = false;
      this.loading = false;
    }
  }

  private async caricaDatiGoogle(shopId: string) {
    try {
      const weekEvents = await this.googleAuth.getEventsThisWeek();
      this.events = weekEvents.filter(ev => this.eventHasShopId(ev, shopId));

      const todayUpcoming = await this.googleAuth.getEventsTodayAfterNow();
      this.upcomingEventsToday = todayUpcoming.filter(ev =>
        this.eventHasShopId(ev, shopId),
      );

      const todayEvents = await this.googleAuth.getEventsToday();
      this.eventsToday = todayEvents.filter(ev =>
        this.eventHasShopId(ev, shopId),
      );
      // NON chiamare renderChart qui!
    } catch (err) {
      this.error = 'Errore nel recupero dati da Google Calendar.';
    }
  }

  async refreshDashboard() {
    this.loading = true;
    this.error = '';
    try {
      const negozio = await firstValueFrom(this.negozi.negozioSelezionato$);
      if (negozio) {
        await this.caricaDatiGoogle(negozio.shopId);
        this.clientiService.getListaClienti(negozio.shopId).subscribe({
          next: clienti => (this.clientiTotali = clienti.length),
          error: () => (this.clientiTotali = 0),
        });
        this.venditeService.getProdottiVendutiOggi(negozio.shopId).subscribe({
          next: n => (this.prodottiVendutiOggi = n),
          error: () => (this.prodottiVendutiOggi = 0),
        });
      }
      this.loading = false;
      this.cdr.detectChanges();
      setTimeout(() => this.renderChart());
    } catch (err) {
      console.error('Errore dettagliato:', err);
      this.error = 'Errore nel recupero dati da Google Calendar.';
      this.loading = false;
    }
  }

  get serviziRichiestiOggi(): number {
    let totale = 0;
    for (const ev of this.eventsToday) {
      if (ev.description) {
        try {
          const obj = JSON.parse(ev.description);
          // Se servizio è presente (oggetto singolo), conta 1
          if (obj.servizio) {
            totale += 1;
          }
        } catch {
          // descrizione non parsabile, ignora
        }
      }
    }
    return totale;
  }

  // Azioni rapide
  async goToNuovoAppuntamento() {
    this.route.navigate(['gestionale-formazione/appointment-calendar'], {
      queryParams: { openNew: true },
    });
  }

  goToNuovoCliente() {
    this.route.navigate(['gestionale-formazione/customers-management'], {
      queryParams: { openNew: true },
    });
  }

  goToNuovoServizio() {
    this.route.navigate(['gestionale-formazione/services-management'], {
      queryParams: { openNew: true },
    });
  }
}
