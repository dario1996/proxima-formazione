import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { PageTitleComponent } from '../../../../core/page-title/page-title.component';
import { PiattaformeService } from '../../../../core/services/data/piattaforme.service';
import { IPiattaforma } from '../../../../shared/models/Piattaforma';
import { ApiMsg } from '../../../../shared/models/ApiMsg';
import { ToastrService } from 'ngx-toastr';
import { ModaleService } from '../../../../core/services/modal.service';
import { FormPiattaformeComponent } from '../../components/form-piattaforme/form-piattaforme.component';
import { DeleteConfirmComponent } from '../../../../core/delete-confirm/delete-confirm.component';
import { RouterModule } from '@angular/router';
import { PiattaformeComponent } from "../../components/piattaforme/piattaforme.component";
import { NavTabsComponent, NavTab } from '../../../../shared/components/nav-tabs/nav-tabs.component';
import { CorsiComponent } from "../../../corsi/pages/corsi/corsi.component";


@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, PageTitleComponent, RouterModule, PiattaformeComponent, NavTabsComponent, CorsiComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent implements OnInit {
  @ViewChild('pageContentInner') pageContentInner!: ElementRef<HTMLDivElement>;
  selectedTab = 'piattaforme';
  buttonText: string = '';
  piattaforme: IPiattaforma[] = [];
  piattaformeLoaded = false;
  closeModalSignal = 0;
  pageSize = 10;
  rowHeight = 53;
  settingsTabs: NavTab[] = [
    { id: 'piattaforme', label: 'Piattaforme', icon: 'fa fa-desktop', active: true },
    { id: 'stato_corsi', label: 'Corsi', icon: 'fa fa-flag' },
    { id: 'sedi', label: 'Sedi', icon: 'fa fa-building' },
    { id: 'ruoli', label: 'Ruoli Dipendenti', icon: 'fa fa-users-cog' }
  ];

  constructor(
    private piattaformeService: PiattaformeService,
    private modaleService: ModaleService,
    private toastr: ToastrService,
  ) {}

  ngOnInit() {
    this.onTabClick(this.selectedTab);
  }

  ngAfterViewInit() {
    this.updatePageSize();
    window.addEventListener('resize', this.updatePageSize.bind(this));
  }

  onTabClick(tab: string) {
      this.selectedTab = tab;
      this.settingsTabs.forEach(t => t.active = t.id === tab);
      
      switch (tab) {
        case 'piattaforme':
          this.buttonText = 'Nuova piattaforma';
          break;
        case 'stato_corsi':
          this.buttonText = 'Nuovo stato corso';
          break;
        case 'sedi':
          this.buttonText = 'Nuova sede';
          break;
        case 'ruoli':
          this.buttonText = 'Nuovo ruolo dipendente';
          break;
        default:
          this.buttonText = '';
      }
    }

  private loadPiattaforme() {
    this.piattaformeService.getListaPiattaforme().subscribe({
      next: data => {
        this.piattaforme = data.map((p: any) => ({
          ...p,
          attiva: p.attiva ? 'Attivo' : 'Non attivo', // <-- qui la trasformazione
        }));
      },
      error: err => {
        this.piattaforme = [];
        this.piattaformeLoaded = false;
      },
    });
  }

  addPiattaforma(piattaformaData: IPiattaforma) {
    this.piattaformeService.addPiattaforma(piattaformaData).subscribe({
      next: this.onSuccess,
      error: this.handleError,
    });
  }

  updatePiattaforma(id: number, piattaformaData: IPiattaforma) {
    this.piattaformeService.editPiattaforma(id, piattaformaData).subscribe({
      next: this.onSuccess,
      error: this.handleError,
    });
  }

  deletePiattaforma(id: number) {
    this.piattaformeService.deletePiattaforma(id).subscribe({
      next: this.onSuccess,
      error: this.handleError,
    });
  }

  onAction(event: { tab: string; type: string; payload?: IPiattaforma }) {
    switch (event.tab) {
      case 'piattaforme':
        switch (event.type) {
          case 'add':
            // if (event.payload) {
            // }
            // this.piattaformeService.addPiattaforma(event.payload).subscribe({
            //   next: this.onSuccess,
            //   error: this.handleError,
            // });

            this.modaleService.apri({
              titolo: 'Aggiungi Piattaforma',
              componente: FormPiattaformeComponent,
              dati: {}, // campi vuoti
              onConferma: (formValue: any) => this.addPiattaforma(formValue),
            });
            break;
          case 'edit':
            // if (event.payload) {
            //   this.piattaformeService
            //     .editPiattaforma(event.payload.id, event.payload)
            //     .subscribe({
            //       next: this.onSuccess,
            //       error: this.handleError,
            //     });
            //   break;
            // }
            this.modaleService.apri({
              titolo: 'Modifica Piattaforma',
              componente: FormPiattaformeComponent,
              dati: event.payload,
              onConferma: (formValue: any) => {
                if (event.payload?.id !== undefined) {
                  this.updatePiattaforma(event.payload.id, formValue);
                } else {
                  this.toastr.error('ID piattaforma non valido', 'Errore');
                }
              },
            });
            break;
          case 'delete':
            this.modaleService.apri({
              titolo: 'Conferma eliminazione',
              componente: DeleteConfirmComponent,
              dati: {
                messaggio:
                  'Vuoi davvero eliminare la piattaforma "' + event.payload?.nome + '"?',
              },
              onConferma: () => {
                if (event.payload?.id !== undefined) {
                  this.deletePiattaforma(event.payload.id);
                } else {
                  this.toastr.error('ID piattaforma non valido', 'Errore');
                }
              },
            });
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

  updatePageSize() {
    if (!this.pageContentInner) return;
    const containerHeight = this.pageContentInner.nativeElement.clientHeight;
    const headerHeight = 37.5;
    const footerHeight = 50;
    const available = containerHeight - headerHeight - footerHeight;
    this.pageSize = Math.max(1, Math.floor(available / this.rowHeight));
  }

    onTabChange(tab: NavTab) {
    this.onTabClick(tab.id);
  }


}
