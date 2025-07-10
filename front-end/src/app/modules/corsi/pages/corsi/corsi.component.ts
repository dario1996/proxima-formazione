import { Component, OnInit, ChangeDetectorRef, OnChanges } from '@angular/core';
import { ICorsi } from '../../../../shared/models/Corsi';
import { CorsiService } from '../../../../core/services/data/corsi.service';
import { ToastrService } from 'ngx-toastr';
import { ToastrModule } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IPiattaforma } from '../../../../shared/models/Piattaforma';
import { TabellaGenericaComponent } from '../../../../shared/components/tabella-generica/tabella-generica.component';
import {
  AzioneColor,
  AzioneType,
  IAzioneDef,
} from '../../../../shared/models/ui/azione-def';
import { IColumnDef } from '../../../../shared/models/ui/column-def';
import { ModaleService } from '../../../../core/services/modal.service';
import { FormCorsiComponent } from '../../components/form-corsi/form-corsi.component';
import { DeleteConfirmComponent } from '../../../../core/delete-confirm/delete-confirm.component';
import { PageTitleComponent } from '../../../../core/page-title/page-title.component';
import {
  ViewChild,
  ElementRef,
  AfterViewInit,
  HostListener,
} from '@angular/core';
import { FiltriGenericiComponent } from '../../../../shared/components/filtri-generici/filtri-generici.component';
import { IFiltroDef } from '../../../../shared/models/ui/filtro-def';
import { PiattaformeService } from '../../../../core/services/data/piattaforme.service';
import { calcolaPageSize } from '../../../../shared/utils/Utils';

@Component({
  selector: 'app-corsi',
  imports: [
    ToastrModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
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

  pageSize = 10; // valore di default
  rowHeight = 53; // px, come da CSS della tabella
  corsi: ICorsi[] = [];
  corsiFiltrati: ICorsi[] = [];
  piattaforme: IPiattaforma[] = [];

  filtri: IFiltroDef[] = [
    {
      key: 'nome',
      label: 'Nome',
      type: 'text',
      placeholder: 'Cerca nome...',
      colClass: 'col-12 col-md-4 col-lg-3 mb-2',
    },
    {
      key: 'argomento',
      label: 'Macro Argomento',
      type: 'text',
      placeholder: 'Cerca argomento...',
      colClass: 'col-12 col-md-4 col-lg-3 mb-2',
    },
    // {
    //   key: 'durata',
    //   label: 'Durata',
    //   type: 'number',
    //   placeholder: 'Cerca durata...',
    //   colClass: 'col-12 col-md-4 col-lg-2 mb-2',
    // },
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
      key: 'piattaforma',
      label: 'Modalità',
      type: 'select',
      options: [], // <-- inizialmente vuoto, verrà riempito dopo
      colClass: 'col-6 col-md-4 col-lg-3 mb-2',
    },
  ];
  valoriFiltri: { [key: string]: any } = {};

  columns: IColumnDef[] = [
    { key: 'nome', label: 'Nome', sortable: true, type: 'text' },
    {
      key: 'argomento',
      label: 'Macro argomento',
      sortable: true,
      type: 'text',
    },
    {
      key: 'isms',
      label: 'ISMS',
      sortable: true,
      type: 'text',
    },
    { key: 'durata', label: 'Durata', sortable: true, type: 'text' },
    {
      key: 'piattaformaNome',
      label: 'Modalità',
      sortable: true,
      type: 'text',
    },
  ];

  actions: IAzioneDef[] = [
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

  constructor(
    private corsiService: CorsiService,
    private piattaformeService: PiattaformeService,
    private modaleService: ModaleService,
    private toastr: ToastrService,
    private cd: ChangeDetectorRef, // <--- aggiungi questo
  ) {}

  ngAfterViewInit() {
    this.updatePageSize();
    window.addEventListener('resize', this.updatePageSize.bind(this));
    this.cd.detectChanges(); // <--- aggiungi questa riga
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
    this.loadPiattaforme(); // <--- aggiungi questa
  }

  private loadCorsi() {
    this.corsiService.getListaCorsi().subscribe({
      next: data => {
        this.corsi = data.map((c: any) => ({
          ...c,
          piattaformaNome: c.piattaforma?.nome || '', // aggiungi questa riga
        }));
        this.applicaFiltri();
        setTimeout(() => this.updatePageSize());
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

  // apriDettaglioCorso(corso: ICorsi) {
  //   this.modaleService.apri({
  //     titolo: 'Dettagli corso',
  //     componente: FormCorsiComponent,
  //     dati: corso
  //   });
  // }

  onFiltriChange(valori: { [key: string]: any }) {
    this.valoriFiltri = valori;
    this.applicaFiltri();
  }

  applicaFiltri() {
    this.corsiFiltrati = this.corsi.filter(c => {
      // const nominativo = `${d.nome} ${d.cognome}`.trim().toLowerCase();

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
      // if (
      //   this.valoriFiltri['durata'] &&
      //   !c.durata.toLowerCase().includes(this.valoriFiltri['ruolo'].toLowerCase())
      // ) {
      //   return false;
      // }

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
