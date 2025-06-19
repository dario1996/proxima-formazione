import { ActivatedRoute, RouterModule } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { SalutiDataService } from '../../../../core/services/data/saluti-data.service';

import { HeaderComponent } from '../../../../core/header/header.component';

@Component({
  selector: 'app-welcome',
  standalone: true,
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css',
  imports: [RouterModule, HeaderComponent],
})
export class WelcomeComponent implements OnInit {
  menuItems = [
    {
      title: 'Home',
      icon: 'fa-solid fa-house-user fa-xl',
      links: [
        {
          label: 'Dashboard',
          url: 'dashboard',
          icon: 'fa-solid fa-house-user fa-lg',
        },
      ],
    },
    {
      title: 'Negozio',
      icon: 'fa-solid fa-basket-shopping fa-xl',
      links: [
        {
          label: 'Dipendenti',
          url: 'employees-management',
          icon: 'fa-solid fa-users fa-lg',
        },
        {
          label: 'Clienti',
          url: 'customers-management',
          icon: 'fa-solid fa-user-tie fa-lg',
        },
        // {
        //   label: 'Prodotti e Brand',
        //   url: 'products-management',
        //   icon: 'fa-solid fa-basket-shopping fa-lg',
        // },
        {
          label: 'Servizi',
          url: 'services-management',
          icon: 'fa-solid fa-person-booth fa-lg',
        },
        // {
        //   label: 'Fatture negozio',
        //   url: 'shop-invoices',
        //   icon: 'fa-solid fa-file-lines fa-lg',
        // },
      ],
    },
    {
      title: 'Magazzino',
      icon: 'fa-solid fa-warehouse fa-lg',
      links: [
        {
          label: 'Scanner Prodotti',
          url: 'product-scanner',
          icon: 'fa-solid fa-barcode fa-lg',
        },
        {
          label: 'Sommario magazzino',
          url: 'summary-warehouse',
          icon: 'fa-solid fa-warehouse fa-lg',
        },
        // {
        //   label: 'Fatture prodotti',
        //   url: 'product-invoices',
        //   icon: 'fa-solid fa-file-invoice-dollar fa-lg',
        // },
      ],
    },
    {
      title: 'Appuntamenti',
      icon: 'fa-solid fa-calendar fa-xl',
      links: [
        {
          label: 'Agenda',
          url: 'appointment-calendar',
          icon: 'fa-solid fa-calendar-days fa-lg',
        },
        {
          label: 'Messaggi automatici',
          url: 'manage-automatic-message',
          icon: 'fa-solid fa-comment-sms fa-lg',
        },
      ],
    },
    {
      title: 'Vendite',
      icon: 'fa-solid fa-cash-register fa-xl',
      links: [
        {
          label: 'Cassa',
          url: 'cash-register',
          icon: 'fa-solid fa-cash-register fa-lg',
        },
        {
          label: 'Registro giornaliero',
          url: 'sales-register',
          icon: 'fa-solid fa-book fa-lg',
        },
        {
          label: 'Archivio',
          url: 'sales-archive',
          icon: 'fa-solid fa-box-archive fa-lg',
        },
      ],
    },
    {
      title: 'Statistiche',
      icon: 'fa-solid fa-chart-line fa-lg',
      links: [
        {
          label: 'Andamento negozio',
          url: 'shop-performance',
          icon: 'fa-solid fa-chart-line fa-lg',
        },
        {
          label: 'Andamento personale (dipendenti)',
          url: 'staff-performance',
          icon: 'fa-solid fa-users fa-lg',
        },
      ],
    },
  ];

  isOpen: boolean[] = [];
  selectedLink: any = null;

  utente = '';

  titolo = 'Benvenuti in Smart Control';
  sottotitolo = 'Visualizza le offerte del giorno';

  constructor(
    private route: ActivatedRoute,
    private salutiSrv: SalutiDataService,
  ) {}

  ngOnInit(): void {
    this.isOpen = Array(this.menuItems.length).fill(false); // inizializza tutti chiusi
    this.utente = this.route.snapshot.params['userid'];
  }

  saluti = '';
  errore = '';

  getSaluti = (): void => {
    this.salutiSrv.getSaluti(this.utente).subscribe({
      next: this.handleResponse.bind(this),
      error: this.handleError.bind(this),
    });
  };

  handleResponse(response: object) {
    this.saluti = response.toString();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleError(error: any) {
    console.log(error);
    this.errore = error.error.message;
  }

  toggleAccordion(index: number): void {
    this.isOpen[index] = !this.isOpen[index];
  }

  selectLink(link: any): void {
    this.selectedLink = link;
  }
}
