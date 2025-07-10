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
import { PiattaformeService } from '../../../../core/services/data/piattaforme.service';
import { calcolaPageSize } from '../../../../shared/utils/Utils';
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
  ],
  templateUrl: './corsi.component.html',
  styleUrls: ['./corsi.component.css'],
  standalone: true,
})
export class CorsiComponent implements AfterViewInit, OnInit, OnChanges {
  @ViewChild('pageContentInner') pageContentInner!: ElementRef<HTMLDivElement>;

  pageSize = 10;
  corsi: ICorsi[] = [];
  corsiFiltrati: ICorsi[] = [];
  piattaforme: IPiattaforma[] = [];

  columns = CORSI_COLUMNS;
  filtri = CORSI_FILTRI;
  actions = CORSI_AZIONI;

  valoriFiltri: { [key: string]: any } = {};

  constructor(
    private corsiService: CorsiService,
    private piattaformeService: PiattaformeService,
    private modaleService: ModaleService,
    private toastr: ToastrService,
    private cd: ChangeDetectorRef,
  ) {}

  ngAfterViewInit() {
    this.updatePageSize();
    window.addEventListener('resize', this.updatePageSize.bind(this));
    this.cd.detectChanges();
  }

  ngOnChanges() {
    this.updatePageSize();
    window.addEventListener('resize', this.updatePageSize.bind(this));
    this.cd.detectChanges();
  }

  updatePageSize() {
    if (!this.pageContentInner) return;
    const container = this.pageContentInner.nativeElement;
    this.pageSize = calcolaPageSize(container);
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
        this.cd.detectChanges(); // <-- aggiorna il DOM subito dopo i filtri
        this.updatePageSize();
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
          dati: {}, // campi vuoti
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
      // case 'view':
      //   this.modaleService.apri({
      //     titolo: 'Dettagli corso',
      //     componente: FormCorsiComponent,
      //     dati: {
      //       messaggio: 'Dettagli del corso selezionato',
      //     }
      //   });
      //   break
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
      //AGGIUNGERE QUANDO ISMS PRESENTE A DATABASE
      // if (this.valoriFiltri['isms'] && d.attivo !== this.valoriFiltri['isms']) {
      //   return false;
      // }
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

    // Trova il filtro e aggiorna le options
    const filtro = this.filtri.find(f => f.key === 'piattaforma');
    if (filtro) {
      filtro.options = piattaformaOptions;
    }
  }
}
