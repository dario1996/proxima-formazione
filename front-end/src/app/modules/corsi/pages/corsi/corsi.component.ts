import { Component, OnInit } from '@angular/core';
import { ICorsi } from '../../../../shared/models/Corsi';
import { CorsiService } from '../../../../core/services/data/corsi.service';
import { ToastrService } from 'ngx-toastr';
import { ToastrModule } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { IPiattaforma } from '../../../../shared/models/Piattaforma';
import { TabellaGenericaComponent } from '../../../../shared/components/tabella-generica/tabella-generica.component';
import { AzioneColor, AzioneType, IAzioneDef } from '../../../../shared/models/ui/azione-def';
import { IColumnDef } from '../../../../shared/models/ui/column-def';
import { ModaleService } from '../../../../core/services/modal.service';
import { FormCorsiComponent } from '../../components/form-corsi/form-corsi.component';
import { DeleteConfirmComponent } from '../../../../core/delete-confirm/delete-confirm.component';
import { PageTitleComponent } from '../../../../core/page-title/page-title.component';
import { ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';



@Component({
  selector: 'app-corsi',
  imports: [
    ToastrModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TabellaGenericaComponent,
    PageTitleComponent,
  ],
  templateUrl: './corsi.component.html',
  styleUrls: ['./corsi.component.css'],
  standalone: true,
})
export class CorsiComponent implements AfterViewInit, OnInit {
  @ViewChild('pageContentInner') pageContentInner!: ElementRef<HTMLDivElement>;
  
  pageSize = 10; // valore di default
  rowHeight = 53; // px, come da CSS della tabella
  corsi: ICorsi[] = [];
  piattaforme: IPiattaforma[] = [];

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
    private modaleService: ModaleService,
    private toastr: ToastrService,
  ) {}

  ngAfterViewInit() {
    this.updatePageSize();
    window.addEventListener('resize', this.updatePageSize.bind(this));
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

  ngOnInit(): void {
    this.loadCorsi();
  }

  private loadCorsi() {
    this.corsiService.getListaCorsi().subscribe({
      next: data => {
        this.corsi = data.map(corso => ({
          ...corso,
          piattaformaNome: corso.piattaforma?.nome || '',
        }));
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
      case 'view':
        this.modaleService.apri({
          titolo: 'Dettagli corso',
          componente: FormCorsiComponent,
          dati: {
            messaggio: 'Dettagli del corso selezionato',
          }
        });
        break
      default:
        console.error('Azione non supportata:', e.tipo);
    }
  }

  apriDettaglioCorso(corso: ICorsi) {
    this.modaleService.apri({
      titolo: 'Dettagli corso',
      componente: FormCorsiComponent,
      dati: corso
    });
  }
  
}
