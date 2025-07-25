import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { AuthJwtService } from '../../../../core/services/authJwt.service';
import { SidebarComponent, MenuItem } from '../../../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-welcome',
  standalone: true,
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css',
  imports: [RouterModule, CommonModule, SidebarComponent],
})
export class WelcomeComponent implements OnInit {
  menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      icon: 'fa-solid fa-tachometer-alt fa-xl',
      links: [
        {
          label: 'Dashboard',
          url: 'dashboard',
          icon: 'fa-solid fa-tachometer-alt fa-lg',
        },
      ],
    },
    {
      title: 'Piano Formativo',
      icon: 'fa-solid fa-graduation-cap fa-xl',
      links: [
        {
          label: 'Piano Formativo',
          url: 'piano-formativo',
          icon: 'fa-solid fa-graduation-cap fa-lg',
        },
      ],
    },
    {
      title: 'Dipendenti',
      icon: 'fa-solid fa-users fa-xl',
      links: [
        {
          label: 'Dipendenti',
          url: 'dipendenti',
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
          url: 'corsi',
          icon: 'fa-solid fa-book fa-lg',
        },
      ],
    },
    {
      title: 'Impostazioni',
      icon: 'fa-solid fa-gears fa-xl',
      links: [
        {
          label: 'Impostazioni',
          url: 'impostazioni',
          icon: 'fa-solid fa-gears fa-lg',
        },
      ],
    },
  ];

  isOpen: boolean[] = [];
  selectedLink: any = null;
  utente = '';

  isSidebarOpen: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public BasicAuth: AuthJwtService,
  ) {}

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (window.innerWidth > 991.98) {
      this.isSidebarOpen = false;
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  ngOnInit(): void {
    this.isOpen = Array(this.menuItems.length).fill(false);
    this.utente = this.route.snapshot.params['userid'];
  }

  errore = '';

  handleError(error: any) {
    console.log(error);
    this.errore = error.error.message;
  }

  toggleAccordion(index: number): void {
    this.isOpen[index] = !this.isOpen[index];
  }

  // Gestori per gli eventi emessi dalla sidebar
  onLinkSelected(link: any): void {
    this.selectedLink = link;
  }

  onSidebarToggle(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  onLogout(): void {
    this.router.navigate(['/login']);
  }
}