import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { PageTitleComponent } from '../../../../core/page-title/page-title.component';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ModalComponent } from '../../../../core/modal/modal.component';
import { NotificationModalComponent } from '../../../../core/modal/notification-modal.component';
import { ConfirmationModalComponent } from '../../../../core/modal/confirmation-modal.component';

import {
  IAssegnazione,
  AssegnazioneStato,
} from '../../../../shared/models/Assegnazione';
import { IDipendenti } from '../../../../shared/models/Dipendenti';
import { ICorsi } from '../../../../shared/models/Corsi';

import { AssegnazioniService } from '../../../../core/services/data/assegnazioni.service';
import { DipendentiService } from '../../../../core/services/data/dipendenti.service';
import { CorsiService } from '../../../../core/services/data/corsi.service';
import { forkJoin } from 'rxjs';
import { TabellaGenericaComponent } from '../../../../shared/components/tabella-generica/tabella-generica.component';
import { FiltriGenericiComponent } from '../../../../shared/components/filtri-generici/filtri-generici.component';
import { PaginationFooterComponent } from '../../../../shared/components/pagination-footer/pagination-footer.component';
import { DettaglioDipendentiComponent } from '../../../dipendenti/components/dettaglio-dipendenti/dettaglio-dipendenti.component';
import { DisableConfirmComponent } from '../../../../core/disable-confirm/disable-confirm.component';
import { DeleteConfirmComponent } from '../../../../core/delete-confirm/delete-confirm.component';
import { FormDipendentiComponent } from '../../../dipendenti/components/form-dipendenti/form-dipendenti.component';
import { ToastrService } from 'ngx-toastr';
import { ModaleService } from '../../../../core/services/modal.service';
import { AzioneColor, AzioneType, IAzioneDef } from '../../../../shared/models/ui/azione-def';
import { IColumnDef } from '../../../../shared/models/ui/column-def';
import { IFiltroDef } from '../../../../shared/models/ui/filtro-def';
import { FormAssegnazioneComponent } from '../../components/form-assegnazione/form-assegnazione.component';

@Component({
  selector: 'app-piano-formativo',
  standalone: true,
  imports: [
    PageTitleComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TabellaGenericaComponent,
    FiltriGenericiComponent,
    PaginationFooterComponent,
  ],
  templateUrl: './piano-formativo.component.html',
  styleUrl: './piano-formativo.component.css',
})
export class PianoFormativoComponent implements OnInit {
  @ViewChild('pageContentInner') pageContentInner!: ElementRef<HTMLDivElement>;
  
  // CORRETTO: ViewChild per referenziare la tabella come in Corsi
  @ViewChild(TabellaGenericaComponent) 
  set tabella(component: TabellaGenericaComponent) {
    this.tabellaComponent = component;
  }
  
  private tabellaComponent!: TabellaGenericaComponent;

  pageSize = 20; // CORRETTO: 20 righe come in Corsi

  filtri: IFiltroDef[] = [
    {
      key: 'nominativo',
      label: 'Dipendente',
      type: 'text',
      placeholder: 'Cerca dipendente...',
      colClass: 'col-12 col-md-4 col-lg-3 mb-2',
    },
    {
      key: 'email',
      label: 'Email',
      type: 'text',
      placeholder: 'Cerca email...',
      colClass: 'col-12 col-md-4 col-lg-3 mb-2',
    },
    {
      key: 'ruolo',
      label: 'Ruolo',
      type: 'text',
      placeholder: 'Cerca ruolo...',
      colClass: 'col-12 col-md-4 col-lg-2 mb-2',
    },
    {
      key: 'isms',
      label: 'ISMS',
      type: 'select',
      options: [
        { value: '', label: 'Tutti' },
        { value: 'Si', label: 'Si' },
        { value: 'No', label: 'No' },
      ],
      colClass: 'col-6 col-md-3 col-lg-2 mb-2',
    },
    {
      key: 'attivo',
      label: 'Stato',
      type: 'select',
      options: [
        { value: '', label: 'Tutti' },
        { value: 'Attivo', label: 'Attivo' },
        { value: 'Non attivo', label: 'Non attivo' },
      ],
      colClass: 'col-6 col-md-3 col-lg-2 mb-2',
    },
  ];
  valoriFiltri: { [key: string]: any } = {};

  dipendenti: IDipendenti[] = [];
  formazioneDipendentiFiltrato: IDipendenti[] = [];

  columns: IColumnDef[] = [
    { key: 'nominativo', label: 'Nominativo', sortable: true, type: 'text' },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      type: 'text',
    },
    {
      key: 'ruolo',
      label: 'Ruolo',
      sortable: true,
      type: 'text',
    },
    { key: 'isms', label: 'ISMS', sortable: true, type: 'text' },
    {
      key: 'attivo',
      label: 'Stato',
      sortable: true,
      type: 'badge',
    },
  ];

  azioni: IAzioneDef[] = [
    {
      label: 'Modifica',
      icon: 'fa fa-pen',
      action: AzioneType.Edit,
      color: AzioneColor.Secondary,
    },
    {
      label: 'Elimina',
      icon: 'fa fa-trash',
      action: AzioneType.Delete,
      color: AzioneColor.Danger,
    },
    {
      label: 'Disattiva',
      icon: 'fa fa-user-slash',
      action: AzioneType.Disable,
      color: AzioneColor.Warning,
    },
  ];

  // CORRETTO: Dati per il footer di paginazione come in Corsi
  paginationInfo = {
    currentPage: 1,
    totalPages: 1,
    pages: [] as number[],
    displayedItems: 0,
    totalItems: 0,
    pageSize: 20,
    entityName: 'dipendenti'
  };

  constructor(
    private dipendentiService: DipendentiService,
    private modaleService: ModaleService,
    private toastr: ToastrService,
    private cd: ChangeDetectorRef,
  ) {}

  ngAfterViewInit() {
    // CORRETTO: Rimosso updatePageSize come in Corsi
    this.cd.detectChanges();
  }

  ngOnInit(): void {
    this.loadDipendenti();
  }

  // RIMOSSO: updatePageSize() method come in Corsi

  private loadDipendenti() {
    this.dipendentiService.getListaDipendenti().subscribe({
      next: data => {
        this.dipendenti = data.map((d: any) => ({
          ...d,
          nominativo: `${d.nome} ${d.cognome}`.trim(),
          attivo: d.attivo ? 'Attivo' : 'Non attivo',
        }));
        this.applicaFiltri();
        this.cd.detectChanges();
        // AGGIUNTO: Aggiorna totalItems come in Corsi
        this.paginationInfo.totalItems = this.dipendenti.length;
      },
      error: error => {
        this.toastr.error('Errore nel caricamento dei dipendenti');
      },
    });
  }

  onFiltriChange(valori: { [key: string]: any }) {
    this.valoriFiltri = valori;
    this.applicaFiltri();
  }

  applicaFiltri() {
    this.formazioneDipendentiFiltrato = this.dipendenti.filter(d => {
      const nominativo = `${d.nome} ${d.cognome}`.trim().toLowerCase();

      if (
        this.valoriFiltri['nominativo'] &&
        !nominativo.includes(this.valoriFiltri['nominativo'].toLowerCase())
      ) {
        return false;
      }
      if (
        this.valoriFiltri['email'] &&
        !d.email.toLowerCase().includes(this.valoriFiltri['email'].toLowerCase())
      ) {
        return false;
      }
      if (
        this.valoriFiltri['ruolo'] &&
        !d.ruolo.toLowerCase().includes(this.valoriFiltri['ruolo'].toLowerCase())
      ) {
        return false;
      }
      if (this.valoriFiltri['attivo'] && d.attivo !== this.valoriFiltri['attivo']) {
        return false;
      }
      return true;
    });
  }

  deleteDipendente(id: number) {
    this.dipendentiService.permanentDeleteDipendente(id).subscribe({
      next: () => {
        this.loadDipendenti();
        this.toastr.success('Dipendente eliminato con successo');
      },
      error: error => {
        this.toastr.error("Errore durante l'eliminazione del dipendente");
      },
    });
  }

  toggleDipendenteStatus(id: number) {
    this.dipendentiService.toggleDipendenteStatus(id).subscribe({
      next: () => {
        this.loadDipendenti();
        this.toastr.success('Stato del dipendente aggiornato con successo');
      },
      error: error => {
        this.toastr.error(
          "Errore durante l'aggiornamento dello stato del dipendente",
        );
      },
    });
  }

  updateDipendente(id: number, dipendenteData: any) {
    this.dipendentiService.updDipendente(id, dipendenteData).subscribe({
      next: () => {
        this.loadDipendenti();
        this.toastr.success('Dipendente modificato con successo');
        this.modaleService.chiudi();
      },
      error: () => {
        this.toastr.error('Errore durante la modifica del dipendente');
      },
    });
  }

  addDipendente(dipendenteData: any) {
    this.dipendentiService.insDipendente(dipendenteData).subscribe({
      next: () => {
        this.loadDipendenti();
        this.toastr.success('Dipendente aggiunto con successo');
        this.modaleService.chiudi();
      },
      error: () => {
        this.toastr.error("Errore durante l'aggiunta del dipendente");
      },
    });
  }

  gestioneAzione(e: { tipo: string; item: any }) {
    switch (e.tipo) {
      case 'edit':
        this.modaleService.apri({
          titolo: 'Modifica dipendente',
          componente: FormDipendentiComponent,
          dati: e.item,
          onConferma: (formValue: any) =>
            this.updateDipendente(e.item.id, formValue),
        });
        break;
      case 'delete':
        this.modaleService.apri({
          titolo: 'Conferma eliminazione',
          componente: DeleteConfirmComponent,
          dati: {
            messaggio:
              'Vuoi davvero eliminare il dipendente "' +
              e.item.nome +
              ' ' +
              e.item.cognome +
              '"?',
          },
          onConferma: () => this.deleteDipendente(e.item.id),
        });
        break;
      case 'disable':
        this.modaleService.apri({
          titolo: 'Conferma disattivazione',
          componente: DisableConfirmComponent,
          dati: {
            messaggio:
              'Vuoi davvero disattivare il dipendente "' +
              e.item.nome +
              ' ' +
              e.item.cognome +
              '"?',
          },
          onConferma: () => this.toggleDipendenteStatus(e.item.id),
        });
        break;
      case 'view':
        this.modaleService.apri({
          titolo: 'Dettagli dipendente',
          componente: DettaglioDipendentiComponent,
          dati: e.item,
        });
        break;
      default:
        console.error('Azione non supportata:', e.tipo);
    }
  }

  // NUOVO: Metodo per gestire il click del pulsante "Assegna corso"
  onAssegnaCorso() {
    this.modaleService.apri({
      titolo: 'Assegna Corso',
      componente: FormAssegnazioneComponent,
      dati: {},
      onConferma: (risultato: any) => {
        if (risultato) {
          this.assegnaCorso(risultato);
        }
      }
    });
  }
  // NUOVO: Metodo per effettuare l'assegnazione
  private assegnaCorso(assegnazione: any) {
    // Qui chiameremo il service per l'assegnazione quando sarà pronto
    console.log('Assegnazione da salvare:', assegnazione);
    
    this.toastr.success(
      `Corso assegnato con successo al dipendente`,
      'Successo'
    );
    
    // Ricarica i dati se necessario
    this.loadDipendenti();
  }

  // CORRETTI: Metodi per la paginazione come in Corsi
  aggiornaPaginazione(paginationData: any) {
    this.paginationInfo = { ...paginationData };
  }

  cambiaPagina(page: number) {
    if (this.tabellaComponent) {
      this.tabellaComponent.goToPage(page);
    }
  }
}
