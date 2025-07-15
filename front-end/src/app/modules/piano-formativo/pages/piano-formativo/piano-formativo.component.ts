import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { PageTitleComponent } from '../../../../core/page-title/page-title.component';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ModalComponent } from '../../../../core/modal/modal.component';
import {
  IAssegnazione,
} from '../../../../shared/models/Assegnazione';
import { AssegnazioniService } from '../../../../core/services/data/assegnazioni.service';
import { TabellaGenericaComponent } from '../../../../shared/components/tabella-generica/tabella-generica.component';
import { FiltriGenericiComponent } from '../../../../shared/components/filtri-generici/filtri-generici.component';
import { PaginationFooterComponent } from '../../../../shared/components/pagination-footer/pagination-footer.component';
import { DeleteConfirmComponent } from '../../../../core/delete-confirm/delete-confirm.component';
// import { FormAssegnazioneComponent } from '../../components/form-assegnazione/form-assegnazione.component';
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
    // FormAssegnazioneComponent,
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
      key: 'dipendente',
      label: 'Dipendente',
      type: 'text',
      placeholder: 'Cerca dipendente...',
      colClass: 'col-12 col-md-4 col-lg-3 mb-2',
    },
    {
      key: 'corso',
      label: 'Corso',
      type: 'text',
      placeholder: 'Cerca corso...',
      colClass: 'col-12 col-md-4 col-lg-3 mb-2',
    },
    {
      key: 'modalita',
      label: 'Modalità',
      type: 'text',
      placeholder: 'Cerca modalità...',
      colClass: 'col-12 col-md-4 col-lg-2 mb-2',
    },
    {
      key: 'stato',
      label: 'Stato',
      type: 'select',
      options: [
        { value: '', label: 'Tutti' },
        { value: 'INIZIATO', label: 'Iniziato' },
        { value: 'IN_CORSO', label: 'In corso' },
        { value: 'TERMINATO', label: 'Terminato' },
        { value: 'INTERROTTO', label: 'Interrotto' },
      ],
      colClass: 'col-6 col-md-3 col-lg-2 mb-2',
    },
    {
      key: 'attestato',
      label: 'Attestato',
      type: 'select',
      options: [
        { value: '', label: 'Tutti' },
        { value: 'Sì', label: 'Sì' },
        { value: 'No', label: 'No' },
      ],
      colClass: 'col-6 col-md-3 col-lg-2 mb-2',
    },
  ];
  valoriFiltri: { [key: string]: any } = {};

  assegnazioni: IAssegnazione[] = [];
  assegnazioniFiltrate: IAssegnazione[] = [];

  columns: IColumnDef[] = [
    { key: 'dipendente', label: 'Dipendente', sortable: true, type: 'text' },
    { key: 'corso', label: 'Corso', sortable: true, type: 'text' },
    { key: 'dataAssegnazione', label: 'Data Assegnazione', sortable: true, type: 'date' },
    { key: 'modalita', label: 'Modalità', sortable: true, type: 'text' },
    { key: 'stato', label: 'Stato', sortable: true, type: 'badge' },
    { key: 'dataTerminePrevista', label: 'Data Termine Prevista', sortable: true, type: 'date' },
    { key: 'dataInizio', label: 'Data Inizio', sortable: true, type: 'date' },
    { key: 'dataFine', label: 'Data Fine', sortable: true, type: 'date' },
    { key: 'attestato', label: 'Attestato', sortable: true, type: 'badge' }
  ];

  azioni: IAzioneDef[] = [
    {
      label: 'Assegna Corso',
      icon: 'fa fa-plus-circle',
      action: AzioneType.Add,
      color: AzioneColor.Primary,
    },
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
  ];

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
    private modaleService: ModaleService,
    private toastr: ToastrService,
    private cd: ChangeDetectorRef,
  ) {}

  ngAfterViewInit() {
    this.cd.detectChanges();
  }

  ngOnInit(): void {
    this.loadAssegnazioni();
  }

private loadAssegnazioni() {
  this.assegnazioniService.getAllAssegnazioni().subscribe({
    next: data => {
      // this.assegnazioni = data.map(assegnazione => ({
      //   ...assegnazione,
      //   dipendente: `${assegnazione.dipendente?.nome} ${assegnazione.dipendente?.cognome}`.trim(),
      //   corso: assegnazione.corso?.nome || 'N/A',
      //   attestato: assegnazione.attestato ? 'Sì' : 'No'
      // }));
      this.assegnazioniFiltrate = [...this.assegnazioni];
      
      // Aggiorna le informazioni di paginazione
      this.paginationInfo.totalItems = this.assegnazioni.length;
      this.paginationInfo.displayedItems = this.assegnazioni.length;
      this.paginationInfo.totalPages = Math.ceil(this.assegnazioni.length / this.paginationInfo.pageSize);
    },
    error: () => {
      this.toastr.error('Errore nel caricamento delle assegnazioni');
    },
  });
}

  onFiltriChange(valori: { [key: string]: any }) {
    this.valoriFiltri = valori;
    this.applicaFiltri();
  }

  applicaFiltri() {
    this.assegnazioniFiltrate = this.assegnazioni.filter(assegnazione => {
      // if (
      //   this.valoriFiltri['dipendente'] &&
      //   !assegnazione.dipendente.toLowerCase().includes(this.valoriFiltri['dipendente'].toLowerCase())
      // ) {
      //   return false;
      // }
      // if (
      //   this.valoriFiltri['corso'] &&
      //   !assegnazione.corso.toLowerCase().includes(this.valoriFiltri['corso'].toLowerCase())
      // ) {
      //   return false;
      // }
      if (
        this.valoriFiltri['modalita'] &&
        !assegnazione.modalita?.toLowerCase().includes(this.valoriFiltri['modalita'].toLowerCase())
      ) {
        return false;
      }
      if (this.valoriFiltri['stato'] && assegnazione.stato !== this.valoriFiltri['stato']) {
        return false;
      }
      if (this.valoriFiltri['attestato'] && assegnazione.attestato !== this.valoriFiltri['attestato']) {
        return false;
      }
      return true;
    });
  }

  addAssegnazione(assegnazioneData: any) {
    this.assegnazioniService.assignCorsoToDipendente(
      assegnazioneData.dipendenteId,
      assegnazioneData.corsoId,
      assegnazioneData.obbligatorio || false
    ).subscribe({
      next: () => {
        this.loadAssegnazioni();
        this.toastr.success('Corso assegnato con successo');
        this.modaleService.chiudi();
      },
      error: () => {
        this.toastr.error("Errore durante l'assegnazione del corso");
      },
    });
  }

  updateAssegnazione(id: number, assegnazioneData: any) {
    this.assegnazioniService.updateAssegnazione(id, assegnazioneData).subscribe({
      next: () => {
        this.loadAssegnazioni();
        this.toastr.success('Assegnazione modificata con successo');
        this.modaleService.chiudi();
      },
      error: () => {
        this.toastr.error('Errore durante la modifica dell\'assegnazione');
      },
    });
  }

  deleteAssegnazione(id: number) {
    this.assegnazioniService.deleteAssegnazione(id).subscribe({
      next: () => {
        this.loadAssegnazioni();
        this.toastr.success('Assegnazione eliminata con successo');
      },
      error: () => {
        this.toastr.error("Errore durante l'eliminazione dell'assegnazione");
      },
    });
  }

  gestioneAzione(e: { tipo: string; item: any }) {
    switch (e.tipo) {
      // case 'add':
      //   this.modaleService.apri({
      //     titolo: 'Assegna Corso',
      //     componente: FormAssegnazioneComponent,
      //     dati: {},
      //     onConferma: (formValue: any) => this.addAssegnazione(formValue),
      //   });
      //   break;
      // case 'edit':
      //   this.modaleService.apri({
      //     titolo: 'Modifica Assegnazione',
      //     componente: ,
      //     dati: e.item,
      //     onConferma: (formValue: any) =>
      //       this.updateAssegnazione(e.item.id, formValue),
      //   });
      //   break;
      // case 'delete':
      //   this.modaleService.apri({
      //     titolo: 'Conferma eliminazione',
      //     componente: DeleteConfirmComponent,
      //     dati: {
      //       messaggio:
      //         'Vuoi davvero eliminare l\'assegnazione del corso "' +
      //         e.item.corso +
      //         '" per "' +
      //         e.item.dipendente +
      //         '"?',
      //     },
      //     onConferma: () => this.deleteAssegnazione(e.item.id),
      //   });
      //   break;
      default:
        console.error('Azione non supportata:', e.tipo);
    }
  }

  aggiornaPaginazione(paginationData: any) {
    this.paginationInfo = { ...paginationData };
  }

  cambiaPagina(page: number) {
    if (this.tabellaComponent) {
      this.tabellaComponent.goToPage(page);
    }
  }
}
