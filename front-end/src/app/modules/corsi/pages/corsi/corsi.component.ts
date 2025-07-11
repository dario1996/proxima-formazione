import { Component, OnInit, ChangeDetectorRef, OnChanges } from '@angular/core';
import { ICorsi } from '../../../../shared/models/Corsi';
import { CorsiService } from '../../../../core/services/data/corsi.service';
import { ToastrService } from 'ngx-toastr';
import { ToastrModule } from 'ngx-toastr';
import { IPiattaforma } from '../../../../shared/models/Piattaforma';
import { TabellaGenericaComponent } from '../../../../shared/components/tabella-generica/tabella-generica.component';
import { ModaleService } from '../../../../core/services/modal.service';
import { FormCorsiComponent } from '../../components/form-corsi/form-corsi.component';
import { DeleteConfirmComponent } from '../../../../core/delete-confirm/delete-confirm.component';
import { PageTitleComponent } from '../../../../core/page-title/page-title.component';
import { ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FiltriGenericiComponent } from '../../../../shared/components/filtri-generici/filtri-generici.component';
// AGGIUNTO: Import del PaginationFooterComponent
import { PaginationFooterComponent } from '../../../../shared/components/pagination-footer/pagination-footer.component';
import { PiattaformeService } from '../../../../core/services/data/piattaforme.service';
import {
  CORSI_COLUMNS,
  CORSI_FILTRI,
  CORSI_AZIONI,
} from '../../../../shared/config/corsi.config';

@Component({
  selector: 'app-corsi',
  imports: [
    ToastrModule,
    TabellaGenericaComponent,
    PageTitleComponent,
    FiltriGenericiComponent,
    // AGGIUNTO: PaginationFooterComponent nell'array imports
    PaginationFooterComponent,
  ],
  templateUrl: './corsi.component.html',
  styleUrls: ['./corsi.component.css'],
  standalone: true,
})
export class CorsiComponent implements AfterViewInit, OnInit, OnChanges {
  @ViewChild('pageContentInner') pageContentInner!: ElementRef<HTMLDivElement>;
  
  // AGGIUNTO: ViewChild per referenziare la tabella
  @ViewChild(TabellaGenericaComponent) 
  set tabella(component: TabellaGenericaComponent) {
    this.tabellaComponent = component;
  }
  
  private tabellaComponent!: TabellaGenericaComponent; // AGGIUNTO

  pageSize = 20; // FISSO: Sempre 20 righe
  corsi: ICorsi[] = [];
  corsiFiltrati: ICorsi[] = [];
  piattaforme: IPiattaforma[] = [];

  columns = CORSI_COLUMNS;
  filtri = CORSI_FILTRI;
  actions = CORSI_AZIONI;

  valoriFiltri: { [key: string]: any } = {};

  // AGGIUNTO: Dati per il footer di paginazione
  paginationInfo = {
    currentPage: 1,
    totalPages: 1,
    pages: [] as number[],
    displayedItems: 0,
    totalItems: 0,
    pageSize: 20,
    entityName: 'corsi'
  };

  constructor(
    private corsiService: CorsiService,
    private piattaformeService: PiattaformeService,
    private modaleService: ModaleService,
    private toastr: ToastrService,
    private cd: ChangeDetectorRef,
  ) {}

  ngAfterViewInit() {
    // RIMOSSO: updatePageSize() e listener resize
    this.cd.detectChanges();
  }

  ngOnChanges() {
    // RIMOSSO: updatePageSize() e listener resize
    this.cd.detectChanges();
  }

  ngOnInit(): void {
    this.loadCorsi();
    this.loadPiattaforme();
  }

  private loadCorsi() {
    this.corsiService.getListaCorsi().subscribe({
      next: data => {
        this.corsi = data.map((c: any) => ({
          ...c,
          piattaformaNome: c.piattaforma?.nome || '',
        }));
        this.applicaFiltri();
        this.cd.detectChanges();
        this.paginationInfo.totalItems = this.corsi.length;
      },
      error: error => {
        console.log(error);
        if (error) {
          this.toastr.warning(error);
          return;
        } else {
          this.toastr.error('Errore nel caricamento dei corsi');
        }
      },
    });
  }

  loadPiattaforme() {
    this.piattaformeService.getListaPiattaforme().subscribe({
      next: data => {
        this.piattaforme = data;
        this.setPiattaformaFilterOptions();
      },
      error: err => {
        this.piattaforme = [];
        this.setPiattaformaFilterOptions();
      },
    });
  }

  addCorso(corsoData: any) {
    const corsoToSave = {
      ...corsoData,
      piattaforma: { id: parseInt(corsoData.piattaforma) },
    };
    this.corsiService.createCorso(corsoToSave).subscribe({
      next: () => {
        this.loadCorsi();
        this.toastr.success('Corso aggiunto con successo');
        this.modaleService.chiudi();
      },
      error: () => {
        this.toastr.error("Errore durante l'aggiunta del corso");
      },
    });
  }

  deleteCorso(id: number) {
    this.corsiService.deleteCorso(id).subscribe({
      next: () => {
        this.loadCorsi();
        this.toastr.success('Corso eliminato con successo');
      },
      error: error => {
        this.toastr.error("Errore durante l'eliminazione del corso");
      },
    });
  }

  updateCorso(id: number, corsoData: any) {
    const corsoToSave = {
      ...corsoData,
      piattaforma: { id: parseInt(corsoData.piattaforma) },
    };
    this.corsiService.updateCorso(id, corsoToSave).subscribe({
      next: () => {
        this.loadCorsi();
        this.toastr.success('Corso modificato con successo');
        this.modaleService.chiudi();
      },
      error: () => {
        this.toastr.error('Errore durante la modifica del corso');
      },
    });
  }

  gestioneAzione(e: { tipo: string; item: any }) {
    switch (e.tipo) {
      case 'add':
        this.modaleService.apri({
          titolo: 'Aggiungi corso',
          componente: FormCorsiComponent,
          dati: {},
          onConferma: (formValue: any) => this.addCorso(formValue),
        });
        break;
      case 'edit':
        this.modaleService.apri({
          titolo: 'Modifica corso',
          componente: FormCorsiComponent,
          dati: e.item,
          onConferma: (formValue: any) =>
            this.updateCorso(e.item.id, formValue),
        });
        break;
      case 'delete':
        this.modaleService.apri({
          titolo: 'Conferma eliminazione',
          componente: DeleteConfirmComponent,
          dati: {
            messaggio: 'Vuoi davvero eliminare il corso "' + e.item.nome + '"?',
          },
          onConferma: () => this.deleteCorso(e.item.id),
        });
        break;
      default:
        console.error('Azione non supportata:', e.tipo);
    }
  }

  onFiltriChange(valori: { [key: string]: any }) {
    this.valoriFiltri = valori;
    this.applicaFiltri();
  }

  applicaFiltri() {
    this.corsiFiltrati = this.corsi.filter(c => {
      if (
        this.valoriFiltri['nome'] &&
        !c.nome.includes(this.valoriFiltri['nome'].toLowerCase())
      ) {
        return false;
      }
      if (
        this.valoriFiltri['argomento'] &&
        !c.argomento
          .toLowerCase()
          .includes(this.valoriFiltri['argomento'].toLowerCase())
      ) {
        return false;
      }
      if (
        this.valoriFiltri['piattaforma'] &&
        c.piattaforma?.id != this.valoriFiltri['piattaforma']
      ) {
        return false;
      }
      return true;
    });
  }

  setPiattaformaFilterOptions() {
    const piattaformaOptions = [
      { value: '', label: 'Tutti' },
      ...this.piattaforme.map(p => ({
        value: p.id,
        label: p.nome,
      })),
    ];

    const filtro = this.filtri.find(f => f.key === 'piattaforma');
    if (filtro) {
      filtro.options = piattaformaOptions;
    }
  }

  // CORRETTI: Metodi per la paginazione
  aggiornaPaginazione(paginationData: any) {
    this.paginationInfo = { ...paginationData };
  }

  cambiaPagina(page: number) {
    if (this.tabellaComponent) {
      this.tabellaComponent.goToPage(page);
    }
  }
}
