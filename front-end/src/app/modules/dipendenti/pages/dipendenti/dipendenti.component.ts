import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
import { AzioneColor, AzioneType, IAzioneDef } from '../../../../shared/models/ui/azione-def';
import { ModaleService } from '../../../../core/services/modal.service';
import { ToastrService } from 'ngx-toastr';
import { DeleteConfirmComponent } from '../../../../core/delete-confirm/delete-confirm.component';
import { DisableConfirmComponent } from '../../../../core/disable-confirm/disable-confirm.component';
import { FormDipendentiComponent } from '../../components/form-dipendenti/form-dipendenti.component';

@Component({
  selector: 'app-dipendenti',
  standalone: true,
  imports: [
    PageTitleComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TabellaGenericaComponent,
  ],
  templateUrl: './dipendenti.component.html',
  styleUrl: './dipendenti.component.css',
})
export class DipendentiComponent implements OnInit {
  @ViewChild('pageContentInner') pageContentInner!: ElementRef<HTMLDivElement>;

  pageSize = 10; // valore di default
  rowHeight = 60; // px, come da CSS della tabella

  dipendenti: IDipendenti[] = [];
  columns: IColumnDef[] = [
    { key: 'nominativo', label: 'Nominativo', sortable: true, type: 'text' },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      type: 'text',
    },
    { key: 'isms', label: 'ISMS', sortable: true, type: 'text' },
    {
      key: 'ruolo',
      label: 'Ruolo',
      sortable: true,
      type: 'text',
    },
    {
      key: 'azienda',
      label: 'Azienda',
      sortable: true,
      type: 'text',
    },
    {
      key: 'sede',
      label: 'Sede',
      sortable: true,
      type: 'text',
    },
    {
      key: 'community',
      label: 'Community',
      sortable: true,
      type: 'text',
    },
    {
      key: 'commerciale',
      label: 'Responsabile',
      sortable: true,
      type: 'text',
    },
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
    this.cd.detectChanges(); // <--- aggiungi questa riga
  }

  updatePageSize() {
    if (!this.pageContentInner) return;
    const containerHeight = this.pageContentInner.nativeElement.clientHeight;
    // Se hai header/footer sticky nella tabella, sottrai la loro altezza
    const headerHeight = 53; // px, se hai un header fisso
    const footerHeight = 60; // px, se hai un footer sticky
    const available = containerHeight - headerHeight - footerHeight;
    this.pageSize = Math.max(1, Math.floor(available / this.rowHeight));
  }

  private loadDipendenti() {
    this.dipendentiService.getListaDipendenti().subscribe({
      next: data => {
        this.dipendenti = data.map((d: any) => ({
          ...d,
          nominativo: `${d.nome} ${d.cognome}`.trim(),
          attivo: d.attivo ? 'Attivo' : 'Non attivo', // <-- qui la trasformazione
        }));
      },
      error: error => {
        this.toastr.error('Errore nel caricamento dei dipendenti');
      },
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
            messaggio: 'Vuoi davvero eliminare il dipendente "' + e.item.nome + ' ' + e.item.cognome + '"?',
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
      default:
        console.error('Azione non supportata:', e.tipo);
    }
  }
}
