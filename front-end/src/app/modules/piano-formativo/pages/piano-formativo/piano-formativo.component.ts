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
import { ToastrService } from 'ngx-toastr';
import { ModaleService } from '../../../../core/services/modal.service';
import { AzioneColor, AzioneType, IAzioneDef } from '../../../../shared/models/ui/azione-def';
import { IColumnDef } from '../../../../shared/models/ui/column-def';
import { IFiltroDef } from '../../../../shared/models/ui/filtro-def';

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

  assegnazioni: IAssegnazione[] = [];
  formazioneDipendentiFiltrato: IAssegnazione[] = [];

  columns: IColumnDef[] = [
    { 
      key: 'dipendenteNome', 
      label: 'Dipendente', 
      sortable: true, 
      type: 'text'
    },
    {
      key: 'corsoNome',
      label: 'Corso',
      sortable: true,
      type: 'text'
    },
    {
      key: 'dataAssegnazione',
      label: 'Data Assegnazione',
      sortable: true,
      type: 'date',
    },
    {
      key: 'statoDisplay',
      label: 'Stato',
      sortable: true,
      type: 'badge',
    },
    {
      key: 'dataTerminaPrevista',
      label: 'Data Termina Prevista',
      sortable: true,
      type: 'date'
    },
    {
      key: 'dataInizio',
      label: 'Data Inizio',
      sortable: true,
      type: 'date',
    },
    {
      key: 'dataCompletamento',
      label: 'Data Fine',
      sortable: true,
      type: 'date',
    },
    {
      key: 'attestatoDisplay',
      label: 'Attestato',
      sortable: true,
      type: 'badge'
    },
  ];

  azioni: IAzioneDef[] = [
    {
      label: 'Elimina',
      icon: 'fa fa-trash',
      action: AzioneType.Delete,
      color: AzioneColor.Danger,
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
    entityName: 'assegnazioni'
  };

  constructor(
    private assegnazioniService: AssegnazioniService,
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
    this.loadAssegnazioni();
  }

  // RIMOSSO: updatePageSize() method come in Corsi

  private getStatoDisplayLabel(stato: AssegnazioneStato): string {
    switch (stato) {
      case AssegnazioneStato.DA_INIZIARE:
        return 'Da iniziare';
      case AssegnazioneStato.IN_CORSO:
        return 'In corso';
      case AssegnazioneStato.TERMINATO:
        return 'Terminato';
      case AssegnazioneStato.INTERROTTO:
        return 'Interrotto';
      default:
        return stato;
    }
  }

  private loadAssegnazioni() {
    this.assegnazioniService.getAllAssegnazioni().subscribe({
      next: data => {
        this.assegnazioni = data.map((a: IAssegnazione) => ({
          ...a,
          dipendenteNome: `${a.dipendente.nome} ${a.dipendente.cognome}`.trim(),
          corsoNome: a.corso.nome,
          dataTerminaPrevista: a.corso.dataScadenza,
          attestatoDisplay: a.attestato ? 'SI' : 'NO',
          statoDisplay: this.getStatoDisplayLabel(a.stato)
        }));
        this.applicaFiltri();
        this.cd.detectChanges();
        // AGGIUNTO: Aggiorna totalItems come in Corsi
        this.paginationInfo.totalItems = this.assegnazioni.length;
      },
      error: error => {
        this.toastr.error('Errore nel caricamento delle assegnazioni');
      },
    });
  }

  onFiltriChange(valori: { [key: string]: any }) {
    this.valoriFiltri = valori;
    this.applicaFiltri();
  }

  applicaFiltri() {
    this.formazioneDipendentiFiltrato = this.assegnazioni.filter((a: IAssegnazione) => {
      const nominativo = `${a.dipendente.nome} ${a.dipendente.cognome}`.trim().toLowerCase();

      if (
        this.valoriFiltri['nominativo'] &&
        !nominativo.includes(this.valoriFiltri['nominativo'].toLowerCase())
      ) {
        return false;
      }
      if (
        this.valoriFiltri['email'] &&
        !a.dipendente.email.toLowerCase().includes(this.valoriFiltri['email'].toLowerCase())
      ) {
        return false;
      }
      if (
        this.valoriFiltri['ruolo'] &&
        !a.dipendente.ruolo.toLowerCase().includes(this.valoriFiltri['ruolo'].toLowerCase())
      ) {
        return false;
      }
      if (this.valoriFiltri['attivo'] && a.dipendente.attivo !== (this.valoriFiltri['attivo'] === 'Attivo')) {
        return false;
      }
      return true;
    });
  }

  deleteAssegnazione(id: number) {
    this.assegnazioniService.deleteAssegnazione(id).subscribe({
      next: () => {
        this.loadAssegnazioni();
        this.toastr.success('Assegnazione eliminata con successo');
      },
      error: error => {
        this.toastr.error("Errore durante l'eliminazione dell'assegnazione");
      },
    });
  }

  gestioneAzione(e: { tipo: string; item: any }) {
    switch (e.tipo) {
      case 'delete':
        this.modaleService.apri({
          titolo: 'Conferma eliminazione',
          componente: DeleteConfirmComponent,
          dati: {
            messaggio:
              'Vuoi davvero eliminare l\'assegnazione per "' +
              e.item.dipendenteNome +
              '" del corso "' +
              e.item.corsoNome +
              '"?',
          },
          onConferma: () => this.deleteAssegnazione(e.item.id),
        });
        break;
      default:
        console.error('Azione non supportata:', e.tipo);
    }
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
