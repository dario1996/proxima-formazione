import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { PageTitleComponent } from '../../../../core/page-title/page-title.component';
import {
  IDipendenti,
  DipendenteCreateRequest,
} from '../../../../shared/models/Dipendenti';
import { DipendentiService } from '../../../../core/services/data/dipendenti.service';
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
import { TabellaGenericaComponent } from '../../../../shared/components/tabella-generica/tabella-generica.component';
import { IColumnDef } from '../../../../shared/models/ui/column-def';
import {
  AzioneColor,
  AzioneType,
  IAzioneDef,
} from '../../../../shared/models/ui/azione-def';
import { ModaleService } from '../../../../core/services/modal.service';
import { ToastrService } from 'ngx-toastr';
import { DeleteConfirmComponent } from '../../../../core/delete-confirm/delete-confirm.component';
import { DisableConfirmComponent } from '../../../../core/disable-confirm/disable-confirm.component';
import { FormDipendentiComponent } from '../../components/form-dipendenti/form-dipendenti.component';
import { DettaglioDipendentiComponent } from '../../components/dettaglio-dipendenti/dettaglio-dipendenti.component';
import { IFiltroDef } from '../../../../shared/models/ui/filtro-def';
import { FiltriGenericiComponent } from '../../../../shared/components/filtri-generici/filtri-generici.component';
import { calcolaPageSize } from '../../../../shared/utils/Utils';

@Component({
  selector: 'app-dipendenti',
  standalone: true,
  imports: [
    PageTitleComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TabellaGenericaComponent,
    FiltriGenericiComponent,
  ],
  templateUrl: './dipendenti.component.html',
  styleUrl: './dipendenti.component.css',
})
export class DipendentiComponent implements OnInit, AfterViewInit {
  @ViewChild('pageContentInner') pageContentInner!: ElementRef<HTMLDivElement>;

  pageSize = 10; // valore di default
  rowHeight = 60; // px, come da CSS della tabella

  filtri: IFiltroDef[] = [
    {
      key: 'nominativo',
      label: 'Nome',
      type: 'text',
      placeholder: 'Cerca nome...',
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
  dipendentiFiltrati: IDipendenti[] = [];

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
    // {
    //   key: 'azienda',
    //   label: 'Azienda',
    //   sortable: true,
    //   type: 'text',
    // },
    // {
    //   key: 'sede',
    //   label: 'Sede',
    //   sortable: true,
    //   type: 'text',
    // },
    // {
    //   key: 'community',
    //   label: 'Community',
    //   sortable: true,
    //   type: 'text',
    // },
    // {
    //   key: 'commerciale',
    //   label: 'Responsabile',
    //   sortable: true,
    //   type: 'text',
    // },
    { key: 'isms', label: 'ISMS', sortable: true, type: 'text' },
    {
      key: 'attivo',
      label: 'Stato',
      sortable: true,
      type: 'badge',
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
    {
      label: 'Disattiva',
      icon: 'fa fa-user-slash',
      action: AzioneType.Disable,
      color: AzioneColor.Warning,
    },
  ];

  constructor(
    private dipendentiService: DipendentiService,
    private modaleService: ModaleService,
    private toastr: ToastrService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadDipendenti();
  }

  ngAfterViewInit() {
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

  private loadDipendenti() {
    this.dipendentiService.getListaDipendenti().subscribe({
      next: data => {
        this.dipendenti = data.map((d: any) => ({
          ...d,
          nominativo: `${d.nome} ${d.cognome}`.trim(),
          attivo: d.attivo ? 'Attivo' : 'Non attivo', // <-- qui la trasformazione
        }));
        this.applicaFiltri();
        setTimeout(() => this.updatePageSize());
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
    this.dipendentiFiltrati = this.dipendenti.filter(d => {
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
    // const corsoToSave = {
    //   ...corsoData,
    //   piattaforma: { id: parseInt(corsoData.piattaforma) },
    // };
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
      case 'add':
        this.modaleService.apri({
          titolo: 'Aggiungi dipendente',
          componente: FormDipendentiComponent,
          dati: {},
          onConferma: (formValue: any) => this.addDipendente(formValue),
        });
        break;
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
}
