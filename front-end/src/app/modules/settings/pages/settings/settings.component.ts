import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PiattaformeComponent } from '../../components/piattaforme/piattaforme.component';
import { PageTitleComponent } from '../../../../core/page-title/page-title.component';
import { PiattaformeService } from '../../../../core/services/data/piattaforme.service';
import { IPiattaforma } from '../../../../shared/models/Piattaforma';
import { ApiMsg } from '../../../../shared/models/ApiMsg';
import { ToastrService } from 'ngx-toastr';

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

  closeModalSignal = 0;

  constructor(
    private piattaformeService: PiattaformeService,
    private toastr: ToastrService,
  ) {}

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

  onAction(event: { tab: string; type: string; payload?: IPiattaforma }) {
    switch (event.tab) {
      case 'piattaforme':
        switch (event.type) {
          case 'ADD':
            if (event.payload) {
              this.piattaformeService.addPiattaforma(event.payload).subscribe({
                next: this.onSuccess,
                error: this.handleError,
              });
            }
            break;
          case 'EDIT':
            if (event.payload) {
              this.piattaformeService.editPiattaforma(event.payload.id, event.payload).subscribe({
                next: this.onSuccess,
                error: this.handleError,
              });
              break;
            }
            break;
          case 'DELETE':
            if (event.payload) {
              this.piattaformeService
                .deletePiattaforma(event.payload.id) // <-- usa solo l'id!
                .subscribe({
                  next: this.onSuccess,
                  error: this.handleError,
                });
            }
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

  onSuccess = (response: ApiMsg) => {
    this.toastr.success(
      response.message || 'Operazione completata con successo!',
      'Successo',
    );
    this.loadPiattaforme();
    this.closeModalSignal++; // cambia valore per notificare il figlio
  };

  handleError = (error: any) => {
    this.toastr.error(
      error?.error?.message || 'Si è verificato un errore!',
      'Errore',
    );
    console.log(error);
  };
}
