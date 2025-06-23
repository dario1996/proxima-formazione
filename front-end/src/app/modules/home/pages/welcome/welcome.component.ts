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
      title: 'Dipendenti',
      icon: 'fa-solid fa-users fa-xl',
      links: [
        {
          label: 'Dipendenti',
          url: 'employees-management',
          icon: 'fa-solid fa-users fa-lg',
        },
      ],
    },
    {
      title: 'Corsi',
      icon: 'fa-solid fa-book fa-xl',
      links: [
        {
          label: 'Corsi',
          url: 'product-scanner',
          icon: 'fa-solid fa-book fa-lg',
        },
      ],
    },
  ];

  isOpen: boolean[] = [];
  selectedLink: any = null;

  utente = '';

  titolo = 'Benvenuti in Gestionale Fortmazione';
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
