import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PiattaformeComponent } from '../../components/piattaforme/piattaforme.component';
import { PageTitleComponent } from '../../../../core/page-title/page-title.component';
import { PiattaformeService } from '../../../../core/services/data/piattaforme.service';
import { IPiattaforma } from '../../../../shared/models/Piattaforma';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, PiattaformeComponent, PageTitleComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
  providers: [PiattaformeService],
})
export class SettingsComponent implements OnInit {
  title: string = 'Settings';
  icon: string = 'fa-solid fa-gears';
  selectedTab = 'piattaforme'; // puoi cambiare la tab di default qui

  piattaforme: IPiattaforma[] = [];
  piattaformeLoaded = false;

  constructor(private piattaformeService: PiattaformeService) {}

  ngOnInit() {
    this.onTabClick(this.selectedTab);
  }

  onTabClick(tab: string) {
    this.selectedTab = tab;
    if (tab === 'piattaforme') {
      this.loadPiattaforme();
    }
    // qui puoi aggiungere altre logiche per altre tab se servono
  }

  private loadPiattaforme() {
    this.piattaformeService.getListaPiattaforme().subscribe({
      next: data => {
        this.piattaforme = data;
        this.piattaformeLoaded = true;
      },
      error: err => {
        this.piattaforme = [];
        this.piattaformeLoaded = false;
      },
    });
  }

  onAction(event: { tab: string; type: string; payload?: any }) {
    switch (event.tab) {
      case 'piattaforme':
        switch (event.type) {
          case 'ADD':
            this.piattaformeService
              .addPiattaforma(event.payload)
              .subscribe(() => this.loadPiattaforme());
            break;
          case 'EDIT':
            this.piattaformeService
              .editPiattaforma(event.payload)
              .subscribe(() => this.loadPiattaforme());
            break;
          case 'DELETE':
            this.piattaformeService
              .deletePiattaforma(event.payload)
              .subscribe(() => this.loadPiattaforme());
            break;
          default:
            console.warn('Azione piattaforme non gestita:', event.type);
        }
        break;
      // altri case per altre tab (es: sedi, ruoli, ecc.)
      default:
        console.warn('Tab non gestita:', event.tab);
    }
  }
}
