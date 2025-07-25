import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  PageTitleComponent,
  ButtonConfig,
} from '../../../../core/page-title/page-title.component';
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
import { FilterPanelComponent } from '../../../../shared/components/filter-panel/filter-panel.component';
import { FilterButtonComponent } from '../../../../shared/components/filter-button/filter-button.component';
import { PaginationFooterComponent } from '../../../../shared/components/pagination-footer/pagination-footer.component';
import { DeleteConfirmComponent } from '../../../../core/delete-confirm/delete-confirm.component';
import { ToastrService } from 'ngx-toastr';
import { ModaleService } from '../../../../core/services/modal.service';
import {
  AzioneColor,
  AzioneType,
  IAzioneDef,
} from '../../../../shared/models/ui/azione-def';
import { IColumnDef } from '../../../../shared/models/ui/column-def';
import { IFiltroDef } from '../../../../shared/models/ui/filtro-def';
import { FormAssegnazioneComponent } from '../../components/form-assegnazione/form-assegnazione.component';
import { ImportAssegnazioniComponent } from '../../components/import-assegnazioni/import-assegnazioni.component';
import { FormModificaAssegnazioneComponent } from '../../components/form-modifica-assegnazione/form-modifica-assegnazione.component';

@Component({
  selector: 'app-piano-formativo',
  standalone: true,
  imports: [
    PageTitleComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TabellaGenericaComponent,
    FilterPanelComponent,
    FilterButtonComponent,
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

  // Filter panel state
  isFilterPanelOpen = false;

  filtri: IFiltroDef[] = [
    {
      key: 'dipendenteNome',
      label: 'Dipendente',
      type: 'text',
      placeholder: 'Cerca dipendente...',
      colClass: 'col-12 col-md-4 col-lg-3 mb-2',
    },
    {
      key: 'corsoNome',
      label: 'Corso',
      type: 'text',
      placeholder: 'Cerca corso...',
      colClass: 'col-12 col-md-4 col-lg-3 mb-2',
    },
    {
      key: 'dataAssegnazione',
      label: 'Data Assegnazione',
      type: 'date',
      placeholder: 'Seleziona data...',
      colClass: 'col-12 col-md-4 col-lg-3 mb-2',
    },
    {
      key: 'impattoIsmsDisplay',
      label: 'Impatto ISMS',
      type: 'select',
      options: [
        { value: '', label: 'Tutti' },
        { value: 'SI', label: 'SI' },
        { value: 'NO', label: 'NO' },
      ],
      colClass: 'col-12 col-md-4 col-lg-3 mb-2',
    },
    {
      key: 'statoDisplay',
      label: 'Stato',
      type: 'select',
      options: [
        { value: '', label: 'Tutti' },
        { value: 'Da iniziare', label: 'Da iniziare' },
        { value: 'In corso', label: 'In corso' },
        { value: 'Terminato', label: 'Terminato' },
        { value: 'Interrotto', label: 'Interrotto' },
      ],
      colClass: 'col-12 col-md-4 col-lg-3 mb-2',
    },
    {
      key: 'dataTerminePrevista',
      label: 'Data Termine Prevista',
      type: 'date',
      placeholder: 'Seleziona data...',
      colClass: 'col-12 col-md-4 col-lg-3 mb-2',
    },
    {
      key: 'dataInizio',
      label: 'Data Inizio',
      type: 'date',
      placeholder: 'Seleziona data...',
      colClass: 'col-12 col-md-4 col-lg-3 mb-2',
    },
    {
      key: 'dataCompletamento',
      label: 'Data Fine',
      type: 'date',
      placeholder: 'Seleziona data...',
      colClass: 'col-12 col-md-4 col-lg-3 mb-2',
    },
    {
      key: 'attestatoDisplay',
      label: 'Attestato',
      type: 'select',
      options: [
        { value: '', label: 'Tutti' },
        { value: 'SI', label: 'SI' },
        { value: 'NO', label: 'NO' },
      ],
      colClass: 'col-12 col-md-4 col-lg-3 mb-2',
    },
    {
      key: 'email',
      label: 'Email Dipendente',
      type: 'text',
      placeholder: 'Cerca email...',
      colClass: 'col-12 col-md-4 col-lg-3 mb-2',
    },
    {
      key: 'ruolo',
      label: 'Ruolo Dipendente',
      type: 'text',
      placeholder: 'Cerca ruolo...',
      colClass: 'col-12 col-md-4 col-lg-3 mb-2',
    },
    {
      key: 'obbligatorio',
      label: 'Obbligatorio',
      type: 'select',
      options: [
        { value: '', label: 'Tutti' },
        { value: 'true', label: 'Sì' },
        { value: 'false', label: 'No' },
      ],
      colClass: 'col-12 col-md-4 col-lg-3 mb-2',
    },
  ];
  valoriFiltri: { [key: string]: any } = {};

  assegnazioni: IAssegnazione[] = [];
  formazioneDipendentiFiltrato: IAssegnazione[] = [];

  // Buttons configuration for page title
  buttons: ButtonConfig[] = [
    {
      text: 'Filtri',
      icon: 'fas fa-filter',
      class: 'btn-secondary',
      action: 'filter',
    },
    {
      text: 'Assegna corso',
      icon: 'fas fa-plus',
      class: 'btn-primary',
      action: 'add',
    },
    {
      text: 'Import massivo',
      icon: 'fas fa-upload',
      class: 'btn-secondary',
      action: 'bulk-import',
    },
  ];

  dipendenti: IDipendenti[] = [];

  columns: IColumnDef[] = [
    {
      key: 'dipendenteNome',
      label: 'Dipendente',
      sortable: true,
      type: 'text',
      maxLength: 25,
    },
    {
      key: 'corsoNome',
      label: 'Corso',
      sortable: true,
      type: 'text',
      maxLength: 35,
    },
    {
      key: 'dataAssegnazione',
      label: 'Data Assegnazione',
      sortable: true,
      type: 'date',
    },
    {
      key: 'impattoIsmsDisplay', // ← CAMBIATO: da impattoIsms a impattoIsmsDisplay
      label: 'Impatto ISMS',
      sortable: true,
      type: 'badge', // ← CAMBIATO: da 'text' a 'badge' per una migliore visualizzazione
      statusType: 'impatto', // ← AGGIUNTO: tipo di badge personalizzato
    },
    {
      key: 'statoDisplay',
      label: 'Stato',
      sortable: true,
      type: 'badge',
      statusType: 'assegnazione',
    },
    {
      key: 'percentualeCompletamento',
      label: 'Percentuale Completamento',
      sortable: true,
      type: 'text',
    },
    {
      key: 'dataTerminePrevista',
      label: 'Data Termine Prevista',
      sortable: true,
      type: 'date',
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
      key: 'esito',
      label: 'Esito',
      sortable: true,
      type: 'text',
    },
    {
      key: 'attestatoDisplay',
      label: 'Attestato',
      sortable: true,
      type: 'badge',
      statusType: 'attestato',
    },
  ];

  azioni: IAzioneDef[] = [
    {
      label: 'Modifica',
      icon: 'fa fa-pen',
      action: AzioneType.Edit,
      color: AzioneColor.Secondary, // Stesso colore della modifica dei corsi
    },
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
    pageSize: 20, // Will be updated by TabellaGenericaComponent
    entityName: 'assegnazioni',
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
          dataTerminePrevista: a.dataTerminePrevista,
          attestatoDisplay: a.attestato ? 'SI' : 'NO',
          impattoIsmsDisplay: a.impattoIsms ? 'SI' : 'NO',
          statoDisplay: this.getStatoDisplayLabel(a.stato),
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

  applicaFiltri() {
    this.formazioneDipendentiFiltrato = this.assegnazioni.filter(
      (a: IAssegnazione) => {
        // Filter by Dipendente Nome
        if (this.valoriFiltri['dipendenteNome']) {
          const nominativo = `${a.dipendente.nome} ${a.dipendente.cognome}`
            .trim()
            .toLowerCase();
          if (
            !nominativo.includes(
              this.valoriFiltri['dipendenteNome'].toLowerCase(),
            )
          ) {
            return false;
          }
        }

        // Filter by Corso Nome
        if (this.valoriFiltri['corsoNome']) {
          if (
            !a.corso.nome
              .toLowerCase()
              .includes(this.valoriFiltri['corsoNome'].toLowerCase())
          ) {
            return false;
          }
        }

        // Filter by Data Assegnazione
        if (this.valoriFiltri['dataAssegnazione']) {
          if (
            !this.compareDates(
              a.dataAssegnazione,
              this.valoriFiltri['dataAssegnazione'],
            )
          ) {
            return false;
          }
        }

        // Filter by Impatto ISMS
        if (this.valoriFiltri['impattoIsmsDisplay']) {
          const impattoDisplay = a.impattoIsms ? 'SI' : 'NO';
          if (impattoDisplay !== this.valoriFiltri['impattoIsmsDisplay']) {
            return false;
          }
        }

        // Filter by Stato
        if (this.valoriFiltri['statoDisplay']) {
          const statoDisplay = this.getStatoDisplayLabel(a.stato);
          if (statoDisplay !== this.valoriFiltri['statoDisplay']) {
            return false;
          }
        }

        // Filter by Data Termine Prevista
        if (this.valoriFiltri['dataTerminePrevista']) {
          if (
            !this.compareDates(
              a.corso.dataScadenza,
              this.valoriFiltri['dataTerminePrevista'],
            )
          ) {
            return false;
          }
        }

        // Filter by Data Inizio
        if (this.valoriFiltri['dataInizio']) {
          if (
            !this.compareDates(a.dataInizio, this.valoriFiltri['dataInizio'])
          ) {
            return false;
          }
        }

        // Filter by Data Completamento
        if (this.valoriFiltri['dataCompletamento']) {
          if (
            !this.compareDates(
              a.dataCompletamento,
              this.valoriFiltri['dataCompletamento'],
            )
          ) {
            return false;
          }
        }

        // Filter by Attestato
        if (this.valoriFiltri['attestatoDisplay']) {
          const attestatoDisplay = a.attestato ? 'SI' : 'NO';
          if (attestatoDisplay !== this.valoriFiltri['attestatoDisplay']) {
            return false;
          }
        }

        // Filter by Email
        if (this.valoriFiltri['email']) {
          if (
            !a.dipendente.email
              .toLowerCase()
              .includes(this.valoriFiltri['email'].toLowerCase())
          ) {
            return false;
          }
        }

        // Filter by Ruolo
        if (this.valoriFiltri['ruolo']) {
          if (
            !a.dipendente.ruolo
              .toLowerCase()
              .includes(this.valoriFiltri['ruolo'].toLowerCase())
          ) {
            return false;
          }
        }

        // Filter by Obbligatorio
        if (
          this.valoriFiltri['obbligatorio'] !== undefined &&
          this.valoriFiltri['obbligatorio'] !== ''
        ) {
          const isObbligatorio = this.valoriFiltri['obbligatorio'] === 'true';
          if (a.obbligatorio !== isObbligatorio) {
            return false;
          }
        }

        return true;
      },
    );
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
    console.log('gestioneAzione chiamata:', e);
    switch (e.tipo) {
      case 'edit':
        console.log('Aprendo modal di modifica per:', e.item);
        this.modaleService.apri({
          titolo: 'Modifica assegnazione',
          componente: FormModificaAssegnazioneComponent,
          dati: e.item,
          onConferma: (formValue: any) => {
            // ✅ CORRETTO: onConferma (come corsi)
            console.log('onConferma ricevuto:', formValue);
            this.updateAssegnazione(e.item.id, formValue);
          },
        });
        break;
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
          onConferma: () => this.deleteAssegnazione(e.item.id), // ✅ CORRETTO: onConferma (come corsi)
        });
        break;
      default:
        console.error('Azione non supportata:', e.tipo);
    }
  }

  updateAssegnazione(id: number, assegnazioneData: any) {
    console.log('Dati ricevuti dal form:', assegnazioneData);

    // Converti i dati del form nel formato richiesto dal service
    const updateData = {
      stato: assegnazioneData.stato,
      dataAssegnazione: assegnazioneData.dataAssegnazione || null,
      impattoIsms: assegnazioneData.impattoIsms || false,
      percentualeCompletamento: assegnazioneData.percentualeCompletamento || 0,
      dataTerminePrevista: assegnazioneData.dataTerminePrevista || null,
      dataInizio: assegnazioneData.dataInizio || null,
      dataCompletamento: assegnazioneData.dataCompletamento || null,
      esito: assegnazioneData.esito || null,
      attestato: assegnazioneData.attestato || false,
    };

    console.log('Dati inviati al servizio:', updateData);

    this.assegnazioniService.updateAssegnazione(id, updateData).subscribe({
      next: () => {
        this.loadAssegnazioni();
        this.toastr.success('Assegnazione modificata con successo');
        this.modaleService.chiudi();
      },
      error: error => {
        console.error("Errore durante l'aggiornamento:", error);
        this.toastr.error("Errore durante la modifica dell'assegnazione");
      },
    });
  }

  // NUOVO: Metodo per gestire il click del pulsante "Assegna corso"
  onAssegnaCorso() {
    this.modaleService.apri({
      titolo: 'Assegna Corso',
      componente: FormAssegnazioneComponent,
      dati: {},
      dimensione: 'xxl',
      onConferma: (risultato: any) => {
        if (risultato) {
          this.assegnaCorso(risultato);
        }
      },
    });
  }

  // Metodo per gestire i click dei pulsanti nella page title
  handleButtonClick(action: string): void {
    switch (action) {
      case 'add':
        this.onAssegnaCorso();
        break;
      case 'bulk-import':
        this.modaleService.apri({
          titolo: 'Import Massivo Assegnazioni',
          componente: ImportAssegnazioniComponent,
          dati: {},
          dimensione: 'xxl',
          onConferma: () => {
            // Refresh the table after import
            this.loadAssegnazioni();
          },
        });
        break;
      case 'filter':
        this.openFilterPanel();
        break;
      default:
        console.warn('Azione non riconosciuta:', action);
    }
  }

  // NUOVO: Metodo per effettuare l'assegnazione
  assegnaCorso(risultato: any) {
    console.log('Dati ricevuti dal form:', risultato);
    console.log(
      'URL chiamata:',
      `http://${this.assegnazioniService.server}:${this.assegnazioniService.port}/api/assegnazioni/bulk`,
    );

    // Verifica che il metodo esista
    if (!this.assegnazioniService.createMultipleAssegnazioni) {
      console.error(
        'Il metodo createMultipleAssegnazioni non esiste nel service!',
      );
      return;
    }

    this.assegnazioniService.createMultipleAssegnazioni(risultato).subscribe({
      next: response => {
        console.log('Risposta dal server:', response);
        const count = Array.isArray(response) ? response.length : 1;
        this.toastr.success(`${count} assegnazione/i create con successo`);
        this.loadAssegnazioni();
        this.modaleService.chiudi();
      },
      error: error => {
        console.error('Errore completo:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        console.error('URL:', error.url);
        this.toastr.error("Errore durante l'assegnazione del corso");
      },
    });
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

  // Filter panel methods
  openFilterPanel() {
    this.isFilterPanelOpen = true;
  }

  closeFilterPanel() {
    this.isFilterPanelOpen = false;
  }

  applyFilters(filtri: { [key: string]: any }) {
    this.valoriFiltri = filtri;
    this.applicaFiltri();
  }

  clearFilters() {
    this.valoriFiltri = {};
    this.applicaFiltri();
  }

  // Get count of active filters
  getActiveFiltersCount(): number {
    return Object.values(this.valoriFiltri).filter(
      value => value !== null && value !== undefined && value !== '',
    ).length;
  }

  // Check if there are any active filters
  hasActiveFilters(): boolean {
    return this.getActiveFiltersCount() > 0;
  }

  // Utility method to compare dates
  private compareDates(date1: string | Date, date2: string | Date): boolean {
    if (!date1 || !date2) return false;

    const d1 = new Date(date1);
    const d2 = new Date(date2);

    // Reset time to compare only dates
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);

    return d1.getTime() === d2.getTime();
  }
}
